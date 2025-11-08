"""Redis Cache Manager for Vajra Backend"""

import logging
import json
import hashlib
from typing import Optional, Any, Callable
from functools import wraps
import asyncio
import os

logger = logging.getLogger(__name__)

REDIS_AVAILABLE = False
redis_client = None

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    logger.warning("Redis not installed. Install with: pip install redis hiredis")


class RedisCache:
    """Redis cache manager with connection pooling."""
    
    def __init__(self, url: Optional[str] = None, enabled: bool = True):
        self.url = url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.enabled = enabled and REDIS_AVAILABLE
        self.client: Optional[redis.Redis] = None
        self._connected = False
        
    async def connect(self) -> bool:
        if not self.enabled:
            logger.info("Redis caching is disabled")
            return False
        
        try:
            self.client = await redis.from_url(
                self.url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=10,  # Connection pool size
                socket_keepalive=True,
                socket_connect_timeout=5,
                retry_on_timeout=True
            )
            
            # Test connection
            await self.client.ping()
            self._connected = True
            logger.info(f"Redis connected successfully to {self.url}")
            return True
            
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Caching disabled.")
            self.enabled = False
            self._connected = False
            return False
    
    async def disconnect(self):
        if self.client:
            await self.client.close()
            self._connected = False
            logger.info("Redis connection closed")
    
    def is_connected(self) -> bool:
        return self._connected and self.enabled
    
    async def get(self, key: str) -> Optional[Any]:
        if not self.is_connected():
            return None
        
        try:
            value = await self.client.get(key)
            if value:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.warning(f"Cache GET error for key '{key}': {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        if not self.is_connected():
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            await self.client.setex(key, ttl, serialized)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.warning(f"Cache SET error for key '{key}': {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        if not self.is_connected():
            return False
        
        try:
            await self.client.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True
        except Exception as e:
            logger.warning(f"Cache DELETE error for key '{key}': {e}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        if not self.is_connected():
            return 0
        
        try:
            keys = []
            async for key in self.client.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                deleted = await self.client.delete(*keys)
                logger.info(f"Cache INVALIDATE: Deleted {deleted} keys matching '{pattern}'")
                return deleted
            return 0
        except Exception as e:
            logger.warning(f"Cache DELETE_PATTERN error for pattern '{pattern}': {e}")
            return 0
    
    async def clear_all(self) -> bool:
        if not self.is_connected():
            return False
        
        try:
            await self.client.flushdb()
            logger.warning("Cache CLEAR: All cache entries cleared")
            return True
        except Exception as e:
            logger.error(f"Cache CLEAR error: {e}")
            return False
    
    async def get_stats(self) -> dict:
        if not self.is_connected():
            return {"status": "disconnected", "enabled": False}
        
        try:
            info = await self.client.info("stats")
            dbsize = await self.client.dbsize()
            
            return {
                "status": "connected",
                "enabled": True,
                "total_keys": dbsize,
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "hit_rate": self._calculate_hit_rate(
                    info.get("keyspace_hits", 0),
                    info.get("keyspace_misses", 0)
                )
            }
        except Exception as e:
            logger.warning(f"Cache STATS error: {e}")
            return {"status": "error", "error": str(e)}
    
    def _calculate_hit_rate(self, hits: int, misses: int) -> float:
        total = hits + misses
        if total == 0:
            return 0.0
        return round((hits / total) * 100, 2)
    
    def generate_cache_key(self, *args, **kwargs) -> str:
        key_data = f"{args}:{sorted(kwargs.items())}"
        return hashlib.sha256(key_data.encode()).hexdigest()[:16]


cache = RedisCache()


def cache_response(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator to cache FastAPI endpoint responses.
    
    Args:
        ttl: Cache TTL in seconds (default: 300 = 5 minutes)
        key_prefix: Prefix for cache key (default: function name)
    
    Usage:
        @app.get("/api/stats")
        @cache_response(ttl=60, key_prefix="stats")
        async def get_stats():
            return {"data": "..."}
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not cache.is_connected():
                # Cache not available, call function directly
                return await func(*args, **kwargs)
            
            # Generate cache key
            prefix = key_prefix or func.__name__
            
            # Extract query parameters for key generation
            cache_key_parts = [prefix]
            for key, value in kwargs.items():
                if key not in ['request', 'response']:  # Exclude FastAPI objects
                    cache_key_parts.append(f"{key}={value}")
            
            cache_key = ":".join(cache_key_parts)
            
            # Try to get from cache
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Cache miss - compute value
            result = await func(*args, **kwargs)
            
            # Store in cache
            await cache.set(cache_key, result, ttl=ttl)
            
            return result
        
        return wrapper
    return decorator


async def invalidate_cache_on_update(patterns: list):
    """
    Invalidate cache entries matching patterns.
    
    Args:
        patterns: List of Redis key patterns to invalidate
        
    Usage:
        await invalidate_cache_on_update(["stats:*", "threats:*"])
    """
    if not cache.is_connected():
        return
    
    for pattern in patterns:
        await cache.delete_pattern(pattern)
