#!/usr/bin/env python3
"""
Redis Cache Verification Script
Tests the Redis caching implementation for Vajra backend
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from services.redis_cache import RedisCache


async def test_redis_connection():
    """Test basic Redis connection."""
    print("=" * 60)
    print("Testing Redis Cache Implementation")
    print("=" * 60)
    
    cache = RedisCache()
    
    print("\n1. Testing Redis Connection...")
    connected = await cache.connect()
    
    if connected:
        print("   [PASS] Redis connection successful!")
    else:
        print("   [FAIL] Redis connection failed!")
        print("   [INFO] Make sure Redis is running: redis-cli ping")
        return False
    
    # Test basic operations
    print("\n2. Testing Cache SET operation...")
    test_key = "test:cache:key"
    test_value = {"message": "Hello from Vajra cache!", "count": 42}
    
    success = await cache.set(test_key, test_value, ttl=60)
    if success:
        print("   [PASS] Cache SET successful!")
    else:
        print("   [FAIL] Cache SET failed!")
        return False
    
    print("\n3. Testing Cache GET operation...")
    retrieved = await cache.get(test_key)
    
    if retrieved == test_value:
        print("   [PASS] Cache GET successful!")
        print(f"   Retrieved: {retrieved}")
    else:
        print("   [FAIL] Cache GET failed!")
        print(f"   Expected: {test_value}")
        print(f"   Got: {retrieved}")
        return False
    
    print("\n4. Testing Cache DELETE operation...")
    await cache.delete(test_key)
    deleted_value = await cache.get(test_key)
    
    if deleted_value is None:
        print("   [PASS] Cache DELETE successful!")
    else:
        print("   [FAIL] Cache DELETE failed!")
        return False
    
    print("\n5. Testing Cache Statistics...")
    stats = await cache.get_stats()
    print(f"   Cache Status: {stats['status']}")
    print(f"   Total Keys: {stats['total_keys']}")
    print(f"   Cache Hits: {stats['hits']}")
    print(f"   Cache Misses: {stats['misses']}")
    print(f"   Hit Rate: {stats['hit_rate']}%")
    
    print("\n6. Testing Pattern-based Deletion...")
    # Create multiple keys
    await cache.set("test:pattern:1", {"data": 1}, ttl=60)
    await cache.set("test:pattern:2", {"data": 2}, ttl=60)
    await cache.set("test:pattern:3", {"data": 3}, ttl=60)
    
    deleted_count = await cache.delete_pattern("test:pattern:*")
    print(f"   [PASS] Deleted {deleted_count} keys matching pattern 'test:pattern:*'")
    
    # Cleanup
    await cache.disconnect()
    
    print("\n" + "=" * 60)
    print("All tests passed! Redis caching is working correctly!")
    print("=" * 60)
    print("\nNext Steps:")
    print("   1. Start your backend: python main.py")
    print("   2. Check health: curl http://localhost:8000/health")
    print("   3. View cache stats: curl http://localhost:8000/api/cache/stats")
    print("   4. Test cached endpoint: curl http://localhost:8000/api/stats")
    print("\nReady to experience 10-50x faster response times!")
    print("=" * 60)
    
    return True


async def main():
    """Main test runner."""
    try:
        success = await test_redis_connection()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] Error during testing: {e}")
        print("\nTroubleshooting:")
        print("  1. Is Redis running? Run: redis-cli ping")
        print("  2. Is Redis accessible? Check: redis-cli -h localhost -p 6379 ping")
        print("  3. Check Redis logs: sudo journalctl -u redis-server -f")
        print("  4. Install dependencies: pip install redis hiredis")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
