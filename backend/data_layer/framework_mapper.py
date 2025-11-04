"""
Framework Mapper
================

Maps threat intelligence data to security frameworks including
MITRE ATT&CK and NIST Cybersecurity Framework (CSF).

Author: AI-Powered Cyber Threat Forecaster Team
Date: November 2025
"""

import logging
import json
from typing import List, Dict, Any, Optional, Set
from dataclasses import dataclass
from enum import Enum

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class AttackTactic(Enum):
    """MITRE ATT&CK Tactics."""
    RECONNAISSANCE = "TA0043"
    RESOURCE_DEVELOPMENT = "TA0042"
    INITIAL_ACCESS = "TA0001"
    EXECUTION = "TA0002"
    PERSISTENCE = "TA0003"
    PRIVILEGE_ESCALATION = "TA0004"
    DEFENSE_EVASION = "TA0005"
    CREDENTIAL_ACCESS = "TA0006"
    DISCOVERY = "TA0007"
    LATERAL_MOVEMENT = "TA0008"
    COLLECTION = "TA0009"
    COMMAND_AND_CONTROL = "TA0011"
    EXFILTRATION = "TA0010"
    IMPACT = "TA0040"


class NISTFunction(Enum):
    """NIST CSF Functions."""
    IDENTIFY = "ID"
    PROTECT = "PR"
    DETECT = "DE"
    RESPOND = "RS"
    RECOVER = "RC"


@dataclass
class AttackMapping:
    """MITRE ATT&CK mapping result."""
    tactic: str
    tactic_id: str
    techniques: List[Dict[str, str]]
    confidence: float


@dataclass
class NISTMapping:
    """NIST CSF mapping result."""
    function: str
    function_id: str
    categories: List[str]
    subcategories: List[str]
    confidence: float


@dataclass
class FrameworkMapping:
    """Complete framework mapping."""
    threat_data: Dict[str, Any]
    attack_mappings: List[AttackMapping]
    nist_mappings: List[NISTMapping]
    metadata: Dict[str, Any]


class FrameworkMapper:
    """
    Framework mapper for threat intelligence.
    
    Aligns threat data with MITRE ATT&CK tactics/techniques and
    NIST Cybersecurity Framework functions/categories.
    """
    
    def __init__(self):
        """Initialize the framework mapper."""
        # Load MITRE ATT&CK mappings
        self.attack_techniques = self._load_attack_techniques()
        
        # Load NIST CSF mappings
        self.nist_categories = self._load_nist_categories()
        
        # Keyword-based mapping rules
        self.technique_keywords = self._build_technique_keywords()
        self.nist_keywords = self._build_nist_keywords()
        
        logger.info("Framework mapper initialized")
        
    def _load_attack_techniques(self) -> Dict[str, Dict[str, Any]]:
        """Load MITRE ATT&CK techniques database (simplified version)."""
        return {
            "T1566": {
                "name": "Phishing",
                "tactic": AttackTactic.INITIAL_ACCESS,
                "description": "Adversaries may send phishing messages to gain access",
                "keywords": ["phishing", "spear phishing", "email", "malicious link"]
            },
            "T1190": {
                "name": "Exploit Public-Facing Application",
                "tactic": AttackTactic.INITIAL_ACCESS,
                "description": "Adversaries may exploit vulnerabilities in public applications",
                "keywords": ["exploit", "vulnerability", "CVE", "web application"]
            },
            "T1059": {
                "name": "Command and Scripting Interpreter",
                "tactic": AttackTactic.EXECUTION,
                "description": "Adversaries may abuse command and script interpreters",
                "keywords": ["powershell", "bash", "script", "command line"]
            },
            "T1055": {
                "name": "Process Injection",
                "tactic": AttackTactic.PRIVILEGE_ESCALATION,
                "description": "Adversaries may inject code into processes",
                "keywords": ["injection", "process", "dll injection", "code injection"]
            },
            "T1070": {
                "name": "Indicator Removal",
                "tactic": AttackTactic.DEFENSE_EVASION,
                "description": "Adversaries may delete or alter indicators of compromise",
                "keywords": ["log clearing", "file deletion", "artifact removal"]
            },
            "T1003": {
                "name": "OS Credential Dumping",
                "tactic": AttackTactic.CREDENTIAL_ACCESS,
                "description": "Adversaries may attempt to dump credentials",
                "keywords": ["credential", "password", "hash", "dumping", "mimikatz"]
            },
            "T1018": {
                "name": "Remote System Discovery",
                "tactic": AttackTactic.DISCOVERY,
                "description": "Adversaries may attempt to get a listing of systems",
                "keywords": ["scanning", "network discovery", "reconnaissance"]
            },
            "T1021": {
                "name": "Remote Services",
                "tactic": AttackTactic.LATERAL_MOVEMENT,
                "description": "Adversaries may use remote services to move laterally",
                "keywords": ["rdp", "ssh", "smb", "lateral movement", "remote access"]
            },
            "T1071": {
                "name": "Application Layer Protocol",
                "tactic": AttackTactic.COMMAND_AND_CONTROL,
                "description": "Adversaries may communicate using application layer protocols",
                "keywords": ["c2", "command and control", "http", "https", "dns"]
            },
            "T1041": {
                "name": "Exfiltration Over C2 Channel",
                "tactic": AttackTactic.EXFILTRATION,
                "description": "Adversaries may steal data over their C2 channel",
                "keywords": ["exfiltration", "data theft", "data stealing"]
            },
            "T1486": {
                "name": "Data Encrypted for Impact",
                "tactic": AttackTactic.IMPACT,
                "description": "Adversaries may encrypt data to impact availability",
                "keywords": ["ransomware", "encryption", "crypto", "locked files"]
            },
            "T1098": {
                "name": "Account Manipulation",
                "tactic": AttackTactic.PERSISTENCE,
                "description": "Adversaries may manipulate accounts to maintain access",
                "keywords": ["account", "user creation", "privilege modification"]
            },
        }
        
    def _load_nist_categories(self) -> Dict[str, Dict[str, Any]]:
        """Load NIST CSF categories (simplified version)."""
        return {
            "ID.AM": {
                "name": "Asset Management",
                "function": NISTFunction.IDENTIFY,
                "subcategories": ["ID.AM-1", "ID.AM-2", "ID.AM-3"],
                "keywords": ["asset", "inventory", "resource"]
            },
            "ID.RA": {
                "name": "Risk Assessment",
                "function": NISTFunction.IDENTIFY,
                "subcategories": ["ID.RA-1", "ID.RA-2", "ID.RA-3"],
                "keywords": ["risk", "assessment", "vulnerability", "threat"]
            },
            "PR.AC": {
                "name": "Access Control",
                "function": NISTFunction.PROTECT,
                "subcategories": ["PR.AC-1", "PR.AC-2", "PR.AC-3"],
                "keywords": ["access control", "authentication", "authorization"]
            },
            "PR.DS": {
                "name": "Data Security",
                "function": NISTFunction.PROTECT,
                "subcategories": ["PR.DS-1", "PR.DS-2", "PR.DS-3"],
                "keywords": ["encryption", "data protection", "confidentiality"]
            },
            "DE.CM": {
                "name": "Continuous Monitoring",
                "function": NISTFunction.DETECT,
                "subcategories": ["DE.CM-1", "DE.CM-2", "DE.CM-3"],
                "keywords": ["monitoring", "detection", "alerting", "logging"]
            },
            "DE.AE": {
                "name": "Anomalies and Events",
                "function": NISTFunction.DETECT,
                "subcategories": ["DE.AE-1", "DE.AE-2", "DE.AE-3"],
                "keywords": ["anomaly", "event", "incident", "suspicious"]
            },
            "RS.RP": {
                "name": "Response Planning",
                "function": NISTFunction.RESPOND,
                "subcategories": ["RS.RP-1"],
                "keywords": ["response", "incident response", "playbook"]
            },
            "RS.MI": {
                "name": "Mitigation",
                "function": NISTFunction.RESPOND,
                "subcategories": ["RS.MI-1", "RS.MI-2", "RS.MI-3"],
                "keywords": ["mitigation", "containment", "remediation"]
            },
            "RC.RP": {
                "name": "Recovery Planning",
                "function": NISTFunction.RECOVER,
                "subcategories": ["RC.RP-1"],
                "keywords": ["recovery", "restoration", "backup"]
            },
        }
        
    def _build_technique_keywords(self) -> Dict[str, List[str]]:
        """Build keyword index for MITRE techniques."""
        keywords = {}
        for tech_id, tech_data in self.attack_techniques.items():
            for keyword in tech_data["keywords"]:
                if keyword not in keywords:
                    keywords[keyword] = []
                keywords[keyword].append(tech_id)
        return keywords
        
    def _build_nist_keywords(self) -> Dict[str, List[str]]:
        """Build keyword index for NIST categories."""
        keywords = {}
        for cat_id, cat_data in self.nist_categories.items():
            for keyword in cat_data["keywords"]:
                if keyword not in keywords:
                    keywords[keyword] = []
                keywords[keyword].append(cat_id)
        return keywords
        
    def map_to_attack(self, threat_data: Dict[str, Any]) -> List[AttackMapping]:
        """
        Map threat data to MITRE ATT&CK framework.
        
        Args:
            threat_data: Threat intelligence data with description, indicators, etc.
            
        Returns:
            List of ATT&CK mappings
        """
        logger.info("Mapping threat data to MITRE ATT&CK...")
        
        # Extract text for analysis
        text_parts = []
        if 'description' in threat_data:
            text_parts.append(threat_data['description'].lower())
        if 'indicators' in threat_data:
            text_parts.extend([str(ind).lower() for ind in threat_data['indicators']])
        if 'behaviors' in threat_data:
            text_parts.extend([str(beh).lower() for beh in threat_data['behaviors']])
            
        combined_text = ' '.join(text_parts)
        
        # Find matching techniques
        technique_matches: Dict[str, float] = {}
        
        for keyword, tech_ids in self.technique_keywords.items():
            if keyword in combined_text:
                for tech_id in tech_ids:
                    technique_matches[tech_id] = technique_matches.get(tech_id, 0) + 1
                    
        # Group by tactics
        tactic_mappings: Dict[str, AttackMapping] = {}
        
        for tech_id, match_count in technique_matches.items():
            tech_data = self.attack_techniques[tech_id]
            tactic = tech_data["tactic"]
            tactic_name = tactic.name.replace('_', ' ').title()
            tactic_id = tactic.value
            
            # Calculate confidence based on keyword matches
            confidence = min(match_count / 3.0, 1.0)
            
            if tactic_id not in tactic_mappings:
                tactic_mappings[tactic_id] = AttackMapping(
                    tactic=tactic_name,
                    tactic_id=tactic_id,
                    techniques=[],
                    confidence=0.0
                )
                
            tactic_mappings[tactic_id].techniques.append({
                'id': tech_id,
                'name': tech_data['name'],
                'confidence': confidence
            })
            
            # Update tactic confidence (max of technique confidences)
            tactic_mappings[tactic_id].confidence = max(
                tactic_mappings[tactic_id].confidence,
                confidence
            )
            
        result = list(tactic_mappings.values())
        logger.info(f"Mapped to {len(result)} ATT&CK tactics with {sum(len(m.techniques) for m in result)} techniques")
        
        return result
        
    def map_to_nist(self, threat_data: Dict[str, Any]) -> List[NISTMapping]:
        """
        Map threat data to NIST Cybersecurity Framework.
        
        Args:
            threat_data: Threat intelligence data
            
        Returns:
            List of NIST CSF mappings
        """
        logger.info("Mapping threat data to NIST CSF...")
        
        # Extract text for analysis
        text_parts = []
        if 'description' in threat_data:
            text_parts.append(threat_data['description'].lower())
        if 'context' in threat_data:
            text_parts.append(str(threat_data['context']).lower())
            
        combined_text = ' '.join(text_parts)
        
        # Find matching categories
        category_matches: Dict[str, float] = {}
        
        for keyword, cat_ids in self.nist_keywords.items():
            if keyword in combined_text:
                for cat_id in cat_ids:
                    category_matches[cat_id] = category_matches.get(cat_id, 0) + 1
                    
        # Create mappings
        mappings = []
        
        for cat_id, match_count in category_matches.items():
            cat_data = self.nist_categories[cat_id]
            function = cat_data["function"]
            
            confidence = min(match_count / 2.0, 1.0)
            
            mappings.append(NISTMapping(
                function=function.name.title(),
                function_id=function.value,
                categories=[cat_id],
                subcategories=cat_data["subcategories"],
                confidence=confidence
            ))
            
        logger.info(f"Mapped to {len(mappings)} NIST CSF categories")
        
        return mappings
        
    def map_threat(self, threat_data: Dict[str, Any]) -> FrameworkMapping:
        """
        Complete framework mapping for threat data.
        
        Args:
            threat_data: Threat intelligence data
            
        Returns:
            Complete framework mapping
        """
        logger.info("Performing complete framework mapping...")
        
        # Map to both frameworks
        attack_mappings = self.map_to_attack(threat_data)
        nist_mappings = self.map_to_nist(threat_data)
        
        # Compile metadata
        metadata = {
            'attack_tactics_count': len(attack_mappings),
            'attack_techniques_count': sum(len(m.techniques) for m in attack_mappings),
            'nist_functions_count': len(set(m.function for m in nist_mappings)),
            'nist_categories_count': len(nist_mappings),
        }
        
        mapping = FrameworkMapping(
            threat_data=threat_data,
            attack_mappings=attack_mappings,
            nist_mappings=nist_mappings,
            metadata=metadata
        )
        
        logger.info("Framework mapping complete")
        return mapping
        
    def export_mapping(self, mapping: FrameworkMapping, format: str = 'json') -> str:
        """
        Export mapping to specified format.
        
        Args:
            mapping: Framework mapping to export
            format: Output format ('json', 'text')
            
        Returns:
            Formatted string
        """
        if format == 'json':
            return json.dumps({
                'threat_data': mapping.threat_data,
                'mitre_attack': [
                    {
                        'tactic': m.tactic,
                        'tactic_id': m.tactic_id,
                        'techniques': m.techniques,
                        'confidence': m.confidence
                    }
                    for m in mapping.attack_mappings
                ],
                'nist_csf': [
                    {
                        'function': m.function,
                        'function_id': m.function_id,
                        'categories': m.categories,
                        'subcategories': m.subcategories,
                        'confidence': m.confidence
                    }
                    for m in mapping.nist_mappings
                ],
                'metadata': mapping.metadata
            }, indent=2)
            
        else:  # text format
            output = "=" * 80 + "\n"
            output += "THREAT INTELLIGENCE FRAMEWORK MAPPING\n"
            output += "=" * 80 + "\n\n"
            
            output += "MITRE ATT&CK Mappings:\n"
            output += "-" * 80 + "\n"
            for m in mapping.attack_mappings:
                output += f"\n{m.tactic} ({m.tactic_id}) - Confidence: {m.confidence:.2f}\n"
                for tech in m.techniques:
                    output += f"  • {tech['id']}: {tech['name']} (conf: {tech['confidence']:.2f})\n"
                    
            output += "\n" + "=" * 80 + "\n"
            output += "NIST CSF Mappings:\n"
            output += "-" * 80 + "\n"
            for m in mapping.nist_mappings:
                output += f"\n{m.function} ({m.function_id}) - Confidence: {m.confidence:.2f}\n"
                output += f"  Categories: {', '.join(m.categories)}\n"
                output += f"  Subcategories: {', '.join(m.subcategories[:3])}...\n"
                
            output += "\n" + "=" * 80 + "\n"
            
            return output


if __name__ == "__main__":
    print("=" * 80)
    print("Framework Mapper - MITRE ATT&CK & NIST CSF Alignment")
    print("=" * 80)
    print()
    
    # Initialize mapper
    print("Initializing framework mapper...")
    mapper = FrameworkMapper()
    print(f"   Loaded {len(mapper.attack_techniques)} ATT&CK techniques")
    print(f"   Loaded {len(mapper.nist_categories)} NIST categories")
    print()
    
    # Demo threat scenarios
    scenarios = [
        {
            "name": "APT Phishing Campaign",
            "data": {
                "description": "Advanced phishing campaign using spear phishing emails with malicious links. "
                              "Adversaries exploit vulnerabilities to gain initial access and establish "
                              "command and control using HTTPS. Credentials are dumped using mimikatz. "
                              "Data exfiltration observed over C2 channel.",
                "indicators": ["phishing", "malicious link", "credential dumping"],
                "behaviors": ["c2 communication", "data exfiltration"],
                "context": "Requires detection and response capabilities"
            }
        },
        {
            "name": "Ransomware Attack",
            "data": {
                "description": "Ransomware deployment following lateral movement via RDP. "
                              "Files encrypted for impact. Log clearing observed to evade detection. "
                              "Process injection used for privilege escalation.",
                "indicators": ["ransomware", "encryption", "rdp"],
                "behaviors": ["lateral movement", "privilege escalation"],
                "context": "Critical incident requiring immediate response and recovery"
            }
        },
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"{'=' * 80}")
        print(f"Scenario {i}: {scenario['name']}")
        print(f"{'=' * 80}")
        print()
        
        # Perform mapping
        mapping = mapper.map_threat(scenario['data'])
        
        # Display results
        print("MITRE ATT&CK Mappings:")
        for m in mapping.attack_mappings:
            print(f"\n   {m.tactic} ({m.tactic_id}) - Confidence: {m.confidence:.2f}")
            for tech in m.techniques[:3]:  # Show top 3
                print(f"     • {tech['id']}: {tech['name']}")
                
        print()
        print("NIST CSF Mappings:")
        for m in mapping.nist_mappings:
            print(f"\n   {m.function} ({m.function_id})")
            print(f"     Categories: {', '.join(m.categories)}")
            
        print()
        
        # Export as JSON
        if i == 1:  # Export first scenario
            print("JSON Export (sample):")
            json_export = mapper.export_mapping(mapping, format='json')
            print(json_export[:500] + "...\n")
            
    print("Framework mapping demonstration complete!")
    print("=" * 80)
