"""
NLP for threat intelligence from dark web chatter and social media.
Uses BERT for entity extraction and risk analysis.
"""

import logging
import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    from transformers import AutoTokenizer, AutoModel, pipeline
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("Transformers library not available. Using mock implementation.")
    TRANSFORMERS_AVAILABLE = False


@dataclass
class ThreatEntity:
    text: str
    entity_type: str
    confidence: float
    start_pos: int
    end_pos: int


@dataclass
class ThreatIntent:
    intent_type: str
    confidence: float
    evidence: str


@dataclass
class AnalysisResult:
    text: str
    entities: List[ThreatEntity]
    intents: List[ThreatIntent]
    topics: List[str]
    sentiment: str
    risk_score: float
    embedding: Optional[np.ndarray] = None


class ThreatChatterNLP:
    def __init__(self, model_name: str = "bert-base-uncased"):
        self.model_name = model_name
        
        if TRANSFORMERS_AVAILABLE:
            try:
                logger.info(f"Loading transformer model: {model_name}")
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.model = AutoModel.from_pretrained(model_name)
                self.model.eval()
                
                # Try to load NER pipeline
                try:
                    self.ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
                except Exception as e:
                    logger.warning(f"Could not load NER pipeline: {e}")
                    self.ner_pipeline = None
                    
                logger.info("Transformer models loaded successfully")
            except Exception as e:
                logger.error(f"Error loading transformer models: {e}")
                self._init_mock_mode()
        else:
            self._init_mock_mode()
            
        # Threat-specific dictionaries
        self.malware_keywords = [
            'ransomware', 'trojan', 'backdoor', 'rootkit', 'keylogger', 
            'botnet', 'rat', 'stealer', 'wiper', 'cryptominer'
        ]
        self.vulnerability_patterns = [
            r'CVE-\d{4}-\d{4,}',
            r'zero[- ]day',
            r'RCE',
            r'SQL injection',
            r'XSS'
        ]
        self.attack_keywords = [
            'exploit', 'payload', 'shell', 'privilege escalation',
            'lateral movement', 'persistence', 'exfiltration'
        ]
        
    def _init_mock_mode(self):
        """Initialize in mock mode when transformers not available."""
        logger.info("Initializing in mock mode")
        self.tokenizer = None
        self.model = None
        self.ner_pipeline = None
        self.mock_mode = True
        
    def extract_entities(self, text: str) -> List[ThreatEntity]:
        entities = []
        
        if self.ner_pipeline and not getattr(self, 'mock_mode', False):
            try:
                # Use transformer NER
                ner_results = self.ner_pipeline(text)
                for ent in ner_results:
                    entities.append(ThreatEntity(
                        text=ent['word'],
                        entity_type=ent['entity_group'].lower(),
                        confidence=ent['score'],
                        start_pos=ent['start'],
                        end_pos=ent['end']
                    ))
            except Exception as e:
                logger.warning(f"NER pipeline failed: {e}, falling back to pattern matching")
                
        # Pattern-based entity extraction
        entities.extend(self._extract_entities_pattern(text))
        
        return entities
        
    def _extract_entities_pattern(self, text: str) -> List[ThreatEntity]:
        """Extract entities using pattern matching."""
        entities = []
        text_lower = text.lower()
        
        # Extract malware mentions
        for malware in self.malware_keywords:
            pattern = r'\b' + re.escape(malware) + r'\b'
            for match in re.finditer(pattern, text_lower):
                entities.append(ThreatEntity(
                    text=match.group(),
                    entity_type='malware',
                    confidence=0.85,
                    start_pos=match.start(),
                    end_pos=match.end()
                ))
                
        # Extract CVEs
        for pattern in self.vulnerability_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                entities.append(ThreatEntity(
                    text=match.group(),
                    entity_type='vulnerability',
                    confidence=0.95,
                    start_pos=match.start(),
                    end_pos=match.end()
                ))
                
        return entities
        
    def detect_intent(self, text: str) -> List[ThreatIntent]:
        intents = []
        text_lower = text.lower()
        
        # Define intent patterns
        intent_patterns = {
            'attack_planning': [
                r'planning (to )?(attack|breach|compromise)',
                r'going to (hack|exploit|target)',
                r'prepare (the )?(payload|exploit)'
            ],
            'exploit_sharing': [
                r'(check out|here is|found) (this |a )?exploit',
                r'(sharing|posting) (the )?(poc|proof of concept)',
                r'vulnerability (details|information)'
            ],
            'reconnaissance': [
                r'scanning for',
                r'looking for (vulnerable|targets)',
                r'reconnaissance on'
            ],
            'data_leak': [
                r'(leaked|dumped|stolen) (data|credentials|database)',
                r'(selling|offering) (access|data)',
                r'database (dump|breach)'
            ]
        }
        
        for intent_type, patterns in intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    match = re.search(pattern, text_lower)
                    evidence = text[max(0, match.start()-20):min(len(text), match.end()+20)]
                    
                    intents.append(ThreatIntent(
                        intent_type=intent_type,
                        confidence=0.75,
                        evidence=evidence.strip()
                    ))
                    break
                    
        return intents
        
    def extract_topics(self, text: str) -> List[str]:
        topics = []
        text_lower = text.lower()
        
        # Topic keywords
        topic_map = {
            'network_security': ['firewall', 'ids', 'ips', 'network', 'packet'],
            'web_security': ['web', 'website', 'sql', 'xss', 'csrf', 'owasp'],
            'malware': ['virus', 'malware', 'trojan', 'ransomware', 'backdoor'],
            'cryptography': ['encryption', 'crypto', 'hash', 'certificate', 'ssl', 'tls'],
            'cloud_security': ['aws', 'azure', 'cloud', 'kubernetes', 'docker'],
            'social_engineering': ['phishing', 'social engineering', 'pretexting'],
            'incident_response': ['incident', 'forensics', 'investigation', 'remediation'],
        }
        
        for topic, keywords in topic_map.items():
            if any(keyword in text_lower for keyword in keywords):
                topics.append(topic)
                
        return topics if topics else ['general_security']
        
    def analyze_sentiment(self, text: str) -> str:
        text_lower = text.lower()
        
        hostile_indicators = ['attack', 'exploit', 'hack', 'breach', 'steal', 'destroy']
        informative_indicators = ['research', 'analysis', 'study', 'report', 'patch', 'fix']
        
        hostile_count = sum(1 for word in hostile_indicators if word in text_lower)
        informative_count = sum(1 for word in informative_indicators if word in text_lower)
        
        if hostile_count > informative_count:
            return 'hostile'
        elif informative_count > hostile_count:
            return 'informative'
        else:
            return 'neutral'
            
    def compute_risk_score(self, entities: List[ThreatEntity], 
                          intents: List[ThreatIntent],
                          sentiment: str) -> float:
        score = 0.0
        
        # Entity-based scoring
        entity_weights = {
            'malware': 0.15,
            'vulnerability': 0.15,
            'actor': 0.10,
            'tool': 0.08,
            'technique': 0.12
        }
        
        for entity in entities:
            weight = entity_weights.get(entity.entity_type, 0.05)
            score += weight * entity.confidence
            
        # Intent-based scoring
        intent_weights = {
            'attack_planning': 0.20,
            'exploit_sharing': 0.18,
            'reconnaissance': 0.12,
            'data_leak': 0.15
        }
        
        for intent in intents:
            weight = intent_weights.get(intent.intent_type, 0.10)
            score += weight * intent.confidence
            
        # Sentiment modifier
        sentiment_modifiers = {
            'hostile': 1.3,
            'neutral': 1.0,
            'informative': 0.8
        }
        score *= sentiment_modifiers.get(sentiment, 1.0)
        score = min(max(score, 0.0), 1.0)
        
        return score
        
    def get_embedding(self, text: str) -> Optional[np.ndarray]:
        if not TRANSFORMERS_AVAILABLE or self.model is None:
            # Return mock embedding
            return np.random.randn(768)
            
        try:
            inputs = self.tokenizer(text, return_tensors="pt", 
                                   truncation=True, max_length=512, 
                                   padding=True)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                embedding = outputs.last_hidden_state[0, 0, :].numpy()
                
            return embedding
        except Exception as e:
            logger.error(f"Error computing embedding: {e}")
            return None
            
    def analyze(self, text: str) -> AnalysisResult:
        logger.info(f"Analyzing text: {text[:100]}...")
        
        entities = self.extract_entities(text)
        logger.debug(f"Extracted {len(entities)} entities")
        
        intents = self.detect_intent(text)
        logger.debug(f"Detected {len(intents)} intents")
        
        topics = self.extract_topics(text)
        logger.debug(f"Identified topics: {topics}")
        
        sentiment = self.analyze_sentiment(text)
        logger.debug(f"Sentiment: {sentiment}")
        
        risk_score = self.compute_risk_score(entities, intents, sentiment)
        logger.debug(f"Risk score: {risk_score:.3f}")
        
        embedding = self.get_embedding(text)
        
        result = AnalysisResult(
            text=text,
            entities=entities,
            intents=intents,
            topics=topics,
            sentiment=sentiment,
            risk_score=risk_score,
            embedding=embedding
        )
        
        logger.info(f"Analysis complete. Risk score: {risk_score:.3f}")
        return result


if __name__ == "__main__":
    print("=" * 80)
    print("Transformer NLP - Threat Chatter Analysis")
    print("=" * 80)
    print()
    
    # Initialize analyzer
    print("Initializing Transformer NLP analyzer...")
    analyzer = ThreatChatterNLP()
    print("   Analyzer ready")
    print()
    
    # Demo threat chatter samples
    samples = [
        "Just found a new zero-day exploit for CVE-2023-12345. The RCE payload is working perfectly. "
        "Planning to use this ransomware against high-value targets next week.",
        
        "Security researchers discovered a critical vulnerability in the authentication system. "
        "A patch has been released and organizations should update immediately.",
        
        "Selling access to compromised database with 500K user credentials. Includes emails, "
        "passwords, and payment information. Contact me for details.",
        
        "New APT campaign using advanced backdoor trojan. Lateral movement techniques observed. "
        "Exfiltration via encrypted channel to C2 server.",
    ]
    
    print("Analyzing threat chatter samples...")
    print()
    
    for i, text in enumerate(samples, 1):
        print(f"{'=' * 80}")
        print(f"Sample {i}:")
        print(f"{'=' * 80}")
        print(f"Text: {text[:100]}...")
        print()
        
        # Analyze
        result = analyzer.analyze(text)
        
        # Display results
        print(f"Risk Score: {result.risk_score:.3f}")
        print(f"Sentiment: {result.sentiment}")
        print(f"Topics: {', '.join(result.topics)}")
        print()
        
        if result.entities:
            print(f"Entities ({len(result.entities)}):")
            for entity in result.entities[:5]:  # Show top 5
                print(f"   • {entity.text} ({entity.entity_type}) - confidence: {entity.confidence:.2f}")
            print()
            
        if result.intents:
            print(f"Intents ({len(result.intents)}):")
            for intent in result.intents:
                print(f"   • {intent.intent_type} - confidence: {intent.confidence:.2f}")
                print(f"     Evidence: \"{intent.evidence[:60]}...\"")
            print()
            
        print()
        
    print("Threat chatter analysis complete!")
    print("=" * 80)
