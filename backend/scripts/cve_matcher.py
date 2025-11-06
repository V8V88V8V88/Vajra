"""
CVE Matcher
Matches detected website technologies against CVE database.
"""

import logging
import re
from typing import Dict, List, Optional
from data_layer.neo4j_connector import Neo4jConnector

logger = logging.getLogger(__name__)


class CVEMatcher:
    """Matches website technologies against CVE database."""
    
    def __init__(self):
        self.connector = Neo4jConnector()
    
    def find_matching_cves(
        self, 
        technologies: Dict[str, List[Dict]], 
        min_severity: str = "medium"
    ) -> List[Dict]:
        """
        Find CVEs matching detected technologies.
        
        Args:
            technologies: Dictionary of detected technologies by category
            min_severity: Minimum severity to include (critical, high, medium, low)
            
        Returns:
            List of matching CVE dictionaries
        """
        matching_cves = []
        
        # Get all CVE nodes from database
        all_cves = self._get_all_cves()
        
        logger.info(f"Total CVEs in database: {len(all_cves)}")
        
        if len(all_cves) == 0:
            logger.warning("No CVEs found in database. Run crawler first to populate CVEs.")
            return []
        
        # Extract technology names for matching
        tech_names = self._extract_tech_names(technologies)
        
        logger.info(f"Searching for CVEs matching {len(tech_names)} technologies: {tech_names[:5]}...")
        
        # Match CVEs against technologies
        for cve in all_cves:
            if self._matches_technology(cve, tech_names, technologies, min_severity):
                matching_cves.append(cve)
        
        # Sort by severity and CVSS score
        matching_cves = self._sort_by_severity(matching_cves)
        
        logger.info(f"Found {len(matching_cves)} matching CVEs (out of {len(all_cves)} total CVEs in database)")
        
        return matching_cves
    
    def _get_all_cves(self) -> List[Dict]:
        """Get all CVE nodes from database."""
        cves = []
        
        for node in self.connector.nodes.values():
            if node.node_type == 'CVE':
                cve_data = {
                    "id": node.node_id,
                    "cve_id": node.properties.get('name', node.node_id),
                    "title": node.properties.get('name', ''),
                    "description": node.properties.get('description', ''),
                    "severity": node.properties.get('severity', 'medium'),
                    "cvss_score": node.properties.get('cvss_score'),
                    "source": node.properties.get('source', ''),
                    "url": node.properties.get('url', ''),
                    "discovered": node.properties.get('discovered'),
                    "metadata": {k: v for k, v in node.properties.items() 
                                if k not in ['name', 'description', 'severity', 'source', 'url', 'discovered']}
                }
                cves.append(cve_data)
        
        return cves
    
    def _extract_tech_names(self, technologies: Dict[str, List[Dict]]) -> List[str]:
        """Extract technology names from detected technologies."""
        names = set()
        
        for category, techs in technologies.items():
            for tech in techs:
                name = tech.get('name', '').lower()
                if name:
                    names.add(name)
                    # Also add variations
                    names.add(name.replace('.', '').replace('-', ''))
                    # Add versioned name if available
                    if tech.get('version'):
                        names.add(f"{name} {tech['version']}")
        
        return list(names)
    
    def _matches_technology(
        self, 
        cve: Dict, 
        tech_names: List[str], 
        technologies: Dict[str, List[Dict]],
        min_severity: str
    ) -> bool:
        """Check if CVE matches any detected technology."""
        # Check severity filter
        severity_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        cve_severity = cve.get('severity', 'medium').lower()
        if severity_order.get(cve_severity, 0) < severity_order.get(min_severity, 0):
            return False
        
        # Get CVE text for matching
        cve_text = (
            cve.get('title', '') + ' ' + 
            cve.get('description', '') + ' ' +
            cve.get('cve_id', '') + ' ' +
            str(cve.get('metadata', {}))
        ).lower()
        
        # Skip generic CVEs that don't mention specific technologies
        # Common generic terms that shouldn't trigger matches
        generic_terms = ['cloudflare', 'cdn', 'proxy', 'server', 'web', 'http', 'https']
        
        # Match against technology names (strict matching)
        for tech_name in tech_names:
            tech_lower = tech_name.lower()
            
            # Skip generic terms unless they're part of a specific product
            if tech_lower in generic_terms and len(tech_lower) < 8:
                continue
            
            # Remove common suffixes/prefixes for better matching
            clean_tech = tech_lower.replace('.js', '').replace('.', '').replace('-', '').replace('_', '')
            
            # Only match if technology name appears in CVE description/title
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(tech_lower) + r'\b'
            if re.search(pattern, cve_text):
                return True
            
            # Also check clean version (without dots/dashes)
            if len(clean_tech) > 3:  # Only for meaningful tech names
                pattern_clean = r'\b' + re.escape(clean_tech) + r'\b'
                if re.search(pattern_clean, cve_text):
                    return True
        
        # Match against specific technology versions (more strict)
        for category, techs in technologies.items():
            for tech in techs:
                name = tech.get('name', '').lower()
                version = tech.get('version')
                
                if name and name not in generic_terms:
                    # Check if CVE mentions this specific technology
                    name_pattern = r'\b' + re.escape(name) + r'\b'
                    if re.search(name_pattern, cve_text):
                        # If version is specified, prefer version-specific matches
                        if version:
                            version_pattern = rf'\b{re.escape(version)}\b'
                            if re.search(version_pattern, cve_text):
                                return True
                        else:
                            # No version specified, match if tech name found
                            return True
        
        return False
    
    def _sort_by_severity(self, cves: List[Dict]) -> List[Dict]:
        """Sort CVEs by severity (critical > high > medium > low) and CVSS score."""
        severity_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        
        def sort_key(cve):
            severity = cve.get('severity', 'medium').lower()
            cvss = float(cve.get('cvss_score', 0)) if cve.get('cvss_score') else 0
            return (severity_order.get(severity, 0), cvss)
        
        return sorted(cves, key=sort_key, reverse=True)
    
    def close(self):
        """Close database connection."""
        self.connector.close()

