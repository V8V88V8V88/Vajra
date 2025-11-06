"""
Website Technology Scanner
Detects web server, framework, CMS, and library versions from HTTP headers and HTML content.
"""

import re
import logging
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from urllib.parse import urlparse
import requests

# Try to import BeautifulSoup, fallback to basic parsing if not available
try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False
    logger.warning("BeautifulSoup4 not available. HTML parsing will be limited.")

logger = logging.getLogger(__name__)


@dataclass
class DetectedTechnology:
    """Represents a detected technology."""
    name: str
    version: Optional[str] = None
    confidence: str = "medium"  # high, medium, low
    source: str = ""  # header, html, script, etc.


class WebsiteScanner:
    """Scans a website to detect technologies and versions."""
    
    def __init__(self, timeout: int = 30, max_redirects: int = 5):
        self.timeout = timeout
        self.max_redirects = max_redirects
        self.session = requests.Session()
        self.session.max_redirects = max_redirects
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
    
    def scan(self, url: str) -> Dict:
        """
        Scan a website and return detected technologies.
        
        Args:
            url: Website URL to scan
            
        Returns:
            Dictionary with detected technologies and metadata
        """
        try:
            # Normalize URL
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            parsed = urlparse(url)
            if not parsed.netloc:
                raise ValueError("Invalid URL")
            
            logger.info(f"Scanning website: {url}")
            
            # Fetch main page
            try:
                response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to fetch {url}: {e}")
                raise
            
            # Detect technologies
            technologies = []
            technologies.extend(self._detect_from_headers(response.headers))
            technologies.extend(self._detect_from_html(response.text, url))
            
            # Organize by category
            organized = self._organize_technologies(technologies)
            
            return {
                "url": url,
                "status_code": response.status_code,
                "technologies": organized,
                "headers": dict(response.headers),
                "detected_at": self._get_timestamp()
            }
            
        except Exception as e:
            logger.error(f"Error scanning {url}: {e}")
            raise
    
    def _detect_from_headers(self, headers: Dict[str, str]) -> List[DetectedTechnology]:
        """Detect technologies from HTTP headers."""
        detected = []
        
        # Server detection
        server = headers.get('Server', '')
        if server:
            detected.extend(self._parse_server_header(server))
        
        # X-Powered-By header
        powered_by = headers.get('X-Powered-By', '')
        if powered_by:
            detected.append(DetectedTechnology(
                name=powered_by.split('/')[0].strip(),
                version=self._extract_version(powered_by),
                confidence="high",
                source="header"
            ))
        
        # Framework detection from headers
        if 'X-Django-Version' in headers:
            detected.append(DetectedTechnology(
                name="Django",
                version=headers['X-Django-Version'],
                confidence="high",
                source="header"
            ))
        
        # Cloudflare detection
        if 'CF-Ray' in headers or 'cf-ray' in headers:
            detected.append(DetectedTechnology(
                name="Cloudflare",
                confidence="high",
                source="header"
            ))
        
        # WordPress detection
        if 'X-Powered-By' in headers and 'WordPress' in headers.get('X-Powered-By', ''):
            detected.append(DetectedTechnology(
                name="WordPress",
                confidence="medium",
                source="header"
            ))
        
        return detected
    
    def _detect_from_html(self, html: str, base_url: str) -> List[DetectedTechnology]:
        """Detect technologies from HTML content."""
        detected = []
        
        if not BS4_AVAILABLE:
            # Fallback to basic regex-based detection
            return self._detect_from_html_basic(html, base_url)
        
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Meta generator tag
            generator = soup.find('meta', attrs={'name': 'generator'})
            if generator and generator.get('content'):
                content = generator['content']
                detected.append(DetectedTechnology(
                    name=content.split()[0] if content else "Unknown",
                    version=self._extract_version(content),
                    confidence="high",
                    source="meta"
                ))
            
            # JavaScript library detection from script tags
            script_tags = soup.find_all('script', src=True)
            for script in script_tags:
                src = script.get('src', '')
                if not src:
                    continue
                
                # CDN patterns
                detected.extend(self._detect_from_cdn(src))
                
                # jQuery detection
                if 'jquery' in src.lower():
                    version = self._extract_version_from_url(src)
                    detected.append(DetectedTechnology(
                        name="jQuery",
                        version=version,
                        confidence="high" if version else "medium",
                        source="script"
                    ))
                
                # React detection
                if 'react' in src.lower() or 'reactjs' in src.lower():
                    version = self._extract_version_from_url(src)
                    detected.append(DetectedTechnology(
                        name="React",
                        version=version,
                        confidence="high" if version else "medium",
                        source="script"
                    ))
                
                # Vue detection
                if 'vue' in src.lower() and 'vuejs' in src.lower():
                    version = self._extract_version_from_url(src)
                    detected.append(DetectedTechnology(
                        name="Vue.js",
                        version=version,
                        confidence="high" if version else "medium",
                        source="script"
                    ))
            
            # WordPress detection from HTML
            if 'wp-content' in html or 'wp-includes' in html:
                detected.append(DetectedTechnology(
                    name="WordPress",
                    confidence="high",
                    source="html"
                ))
            
            # Django detection
            if 'csrfmiddlewaretoken' in html or 'Django' in html:
                detected.append(DetectedTechnology(
                    name="Django",
                    confidence="medium",
                    source="html"
                ))
            
        except Exception as e:
            logger.warning(f"Error parsing HTML: {e}")
        
        return detected
    
    def _detect_from_html_basic(self, html: str, base_url: str) -> List[DetectedTechnology]:
        """Basic HTML detection using regex when BeautifulSoup is not available."""
        detected = []
        
        # WordPress detection
        if 'wp-content' in html or 'wp-includes' in html:
            detected.append(DetectedTechnology(
                name="WordPress",
                confidence="high",
                source="html"
            ))
        
        # Django detection
        if 'csrfmiddlewaretoken' in html or 'Django' in html:
            detected.append(DetectedTechnology(
                name="Django",
                confidence="medium",
                source="html"
            ))
        
        # JavaScript library detection from script tags (basic regex)
        jquery_match = re.search(r'jquery[.-]?(\d+\.\d+(?:\.\d+)?)', html, re.IGNORECASE)
        if jquery_match:
            detected.append(DetectedTechnology(
                name="jQuery",
                version=jquery_match.group(1) if jquery_match.groups() else None,
                confidence="medium",
                source="script"
            ))
        
        # React detection
        if 'react' in html.lower() or 'reactjs' in html.lower():
            detected.append(DetectedTechnology(
                name="React",
                confidence="medium",
                source="script"
            ))
        
        # CDN detection from script tags
        script_pattern = r'<script[^>]+src=["\']([^"\']+)["\']'
        for match in re.finditer(script_pattern, html, re.IGNORECASE):
            src = match.group(1)
            detected.extend(self._detect_from_cdn(src))
        
        return detected
    
    def _detect_from_cdn(self, url: str) -> List[DetectedTechnology]:
        """Detect technologies from CDN URLs."""
        detected = []
        
        # Common CDN patterns
        cdn_patterns = {
            'cdnjs.cloudflare.com': ['jquery', 'bootstrap', 'react', 'vue', 'angular'],
            'cdn.jsdelivr.net': ['jquery', 'bootstrap', 'react', 'vue'],
            'unpkg.com': ['react', 'vue', 'angular'],
        }
        
        for cdn, libs in cdn_patterns.items():
            if cdn in url:
                for lib in libs:
                    if lib in url.lower():
                        version = self._extract_version_from_url(url)
                        detected.append(DetectedTechnology(
                            name=lib.capitalize(),
                            version=version,
                            confidence="medium",
                            source="cdn"
                        ))
        
        return detected
    
    def _parse_server_header(self, server: str) -> List[DetectedTechnology]:
        """Parse Server header to extract server and version."""
        detected = []
        
        # Common server patterns
        patterns = [
            (r'nginx/([\d.]+)', 'Nginx'),
            (r'Apache/([\d.]+)', 'Apache'),
            (r'Microsoft-IIS/([\d.]+)', 'IIS'),
            (r'Caddy/([\d.]+)', 'Caddy'),
            (r'Cloudflare', 'Cloudflare'),
        ]
        
        for pattern, name in patterns:
            match = re.search(pattern, server, re.IGNORECASE)
            if match:
                version = match.group(1) if match.groups() else None
                detected.append(DetectedTechnology(
                    name=name,
                    version=version,
                    confidence="high",
                    source="header"
                ))
                break
        
        return detected
    
    def _extract_version(self, text: str) -> Optional[str]:
        """Extract version number from text."""
        # Match version patterns like 1.2.3, 1.2, v1.2.3
        match = re.search(r'v?(\d+\.\d+(?:\.\d+)?)', text)
        return match.group(1) if match else None
    
    def _extract_version_from_url(self, url: str) -> Optional[str]:
        """Extract version from URL path."""
        # Match patterns like /1.2.3/, /v1.2.3/, /1.2/
        match = re.search(r'[/-]v?(\d+\.\d+(?:\.\d+)?)', url)
        return match.group(1) if match else None
    
    def _organize_technologies(self, technologies: List[DetectedTechnology]) -> Dict[str, List[Dict]]:
        """Organize detected technologies by category."""
        organized = {
            "server": [],
            "framework": [],
            "cms": [],
            "frontend": [],
            "library": [],
            "other": []
        }
        
        # Technology categorization
        server_techs = {'nginx', 'apache', 'iis', 'caddy', 'cloudflare'}
        framework_techs = {'django', 'flask', 'rails', 'express', 'laravel', 'asp.net', 'spring'}
        cms_techs = {'wordpress', 'drupal', 'joomla'}
        frontend_techs = {'react', 'vue.js', 'angular', 'jquery'}
        
        for tech in technologies:
            name_lower = tech.name.lower()
            
            if name_lower in server_techs:
                category = "server"
            elif name_lower in framework_techs:
                category = "framework"
            elif name_lower in cms_techs:
                category = "cms"
            elif name_lower in frontend_techs:
                category = "frontend"
            elif 'library' in tech.source or 'cdn' in tech.source:
                category = "library"
            else:
                category = "other"
            
            organized[category].append({
                "name": tech.name,
                "version": tech.version,
                "confidence": tech.confidence,
                "source": tech.source
            })
        
        # Remove empty categories
        return {k: v for k, v in organized.items() if v}
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.utcnow().isoformat() + "Z"

