"""
Anomaly Detection for Zero-Day Threats using unsupervised machine learning.
"""

import logging
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    SKLEARN_AVAILABLE = True
except ImportError:
    logger.warning("scikit-learn not available. Using basic anomaly detection.")
    SKLEARN_AVAILABLE = False


@dataclass
class ThreatEvent:
    event_id: str
    timestamp: datetime
    features: np.ndarray
    event_type: str
    metadata: Dict


@dataclass
class AnomalyResult:
    event_id: str
    is_anomaly: bool
    anomaly_score: float
    confidence: float
    explanation: str
    similar_events: Optional[List[str]] = None


class AnomalyDetector:
    
    def __init__(self, contamination: float = 0.1, n_estimators: int = 100):
        self.contamination = contamination
        self.n_estimators = n_estimators
        
        if SKLEARN_AVAILABLE:
            self.detector = IsolationForest(
                contamination=contamination,
                n_estimators=n_estimators,
                random_state=42,
                n_jobs=-1
            )
            self.scaler = StandardScaler()
            self.pca = PCA(n_components=0.95)
            logger.info("Isolation Forest detector initialized")
        else:
            self.detector = None
            self.scaler = None
            self.pca = None
            logger.info("Statistical detector initialized")
            
        self.events: List[ThreatEvent] = []
        self.feature_matrix: Optional[np.ndarray] = None
        self.is_trained = False
        
    def add_event(self, event: ThreatEvent) -> None:
        self.events.append(event)
        self.is_trained = False
        
    def add_events(self, events: List[ThreatEvent]) -> None:
        self.events.extend(events)
        self.is_trained = False
        
    def prepare_features(self) -> np.ndarray:
        if not self.events:
            raise ValueError("No events available for training")
            
        features = np.array([event.features for event in self.events])
        features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)
        
        return features
        
    def train(self) -> None:
        logger.info(f"Training anomaly detector on {len(self.events)} events...")
        
        features = self.prepare_features()
        
        if SKLEARN_AVAILABLE and self.detector is not None:
            features_scaled = self.scaler.fit_transform(features)
            
            if features_scaled.shape[1] > 10:
                features_scaled = self.pca.fit_transform(features_scaled)
                logger.debug(f"PCA reduced features to {features_scaled.shape[1]} dimensions")
            
            self.detector.fit(features_scaled)
            self.feature_matrix = features_scaled
            
        else:
            self.feature_matrix = features
            self.mean = np.mean(features, axis=0)
            self.std = np.std(features, axis=0) + 1e-8
            
        self.is_trained = True
        logger.info("Training complete")
        
    def detect_sklearn(self, event: ThreatEvent) -> AnomalyResult:
        if not self.is_trained:
            self.train()
            
        features = event.features.reshape(1, -1)
        features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)
        features_scaled = self.scaler.transform(features)
        
        if hasattr(self.pca, 'components_'):
            features_scaled = self.pca.transform(features_scaled)
        
        prediction = self.detector.predict(features_scaled)[0]
        anomaly_score = -self.detector.score_samples(features_scaled)[0]
        anomaly_score = min(max(anomaly_score / 2.0, 0.0), 1.0)
        
        is_anomaly = prediction == -1
        confidence = abs(anomaly_score - 0.5) * 2
        
        explanation = self._generate_explanation(event, is_anomaly, anomaly_score)
        similar_events = self._find_similar_events(event, top_k=3)
        
        return AnomalyResult(
            event_id=event.event_id,
            is_anomaly=is_anomaly,
            anomaly_score=anomaly_score,
            confidence=confidence,
            explanation=explanation,
            similar_events=similar_events
        )
        
    def detect_statistical(self, event: ThreatEvent) -> AnomalyResult:
        if not self.is_trained:
            self.train()
            
        z_scores = np.abs((event.features - self.mean) / self.std)
        max_z_score = np.max(z_scores)
        
        is_anomaly = max_z_score > 3.0
        anomaly_score = min(max_z_score / 5.0, 1.0)
        confidence = min(max_z_score / 3.0, 1.0)
        
        explanation = self._generate_explanation(event, is_anomaly, anomaly_score)
        similar_events = self._find_similar_events(event, top_k=3)
        
        return AnomalyResult(
            event_id=event.event_id,
            is_anomaly=is_anomaly,
            anomaly_score=anomaly_score,
            confidence=confidence,
            explanation=explanation,
            similar_events=similar_events
        )
        
    def detect(self, event: ThreatEvent) -> AnomalyResult:
        logger.info(f"Analyzing event: {event.event_id}")
        
        if SKLEARN_AVAILABLE and self.detector is not None:
            return self.detect_sklearn(event)
        else:
            return self.detect_statistical(event)
            
    def batch_detect(self, events: List[ThreatEvent]) -> List[AnomalyResult]:
        logger.info(f"Batch analyzing {len(events)} events...")
        
        results = []
        for event in events:
            result = self.detect(event)
            results.append(result)
            
        anomaly_count = sum(1 for r in results if r.is_anomaly)
        logger.info(f"Found {anomaly_count} anomalies out of {len(events)} events")
        
        return results
        
    def _generate_explanation(self, event: ThreatEvent, 
                             is_anomaly: bool, 
                             anomaly_score: float) -> str:
        if is_anomaly:
            severity = "high" if anomaly_score > 0.7 else "medium"
            return (f"Event '{event.event_id}' exhibits unusual patterns "
                   f"({severity} severity, score: {anomaly_score:.3f}). "
                   f"This may indicate a zero-day threat or novel attack technique.")
        else:
            return (f"Event '{event.event_id}' appears normal "
                   f"(score: {anomaly_score:.3f}). "
                   f"Behavior consistent with known threat patterns.")
                   
    def _find_similar_events(self, event: ThreatEvent, top_k: int = 3) -> List[str]:
        if not self.events or len(self.events) < 2:
            return []
            
        similarities = []
        for stored_event in self.events:
            if stored_event.event_id != event.event_id:
                similarity = np.dot(event.features, stored_event.features) / (
                    np.linalg.norm(event.features) * np.linalg.norm(stored_event.features) + 1e-8
                )
                similarities.append((stored_event.event_id, similarity))
                
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return [event_id for event_id, _ in similarities[:top_k]]
        
    def get_anomaly_statistics(self) -> Dict[str, float]:
        if not self.is_trained:
            logger.warning("Model not trained yet")
            return {}
            
        results = self.batch_detect(self.events)
        
        total = len(results)
        anomalies = sum(1 for r in results if r.is_anomaly)
        
        avg_score = np.mean([r.anomaly_score for r in results])
        max_score = max([r.anomaly_score for r in results])
        
        return {
            'total_events': total,
            'anomaly_count': anomalies,
            'anomaly_rate': anomalies / total if total > 0 else 0.0,
            'avg_anomaly_score': avg_score,
            'max_anomaly_score': max_score
        }


def generate_demo_events(n_normal: int = 100, n_anomalies: int = 10) -> List[ThreatEvent]:
    events = []
    
    for i in range(n_normal):
        features = np.random.randn(10) * 0.5
        events.append(ThreatEvent(
            event_id=f"event_normal_{i:03d}",
            timestamp=datetime.now(),
            features=features,
            event_type='normal_attack',
            metadata={'category': 'known_threat'}
        ))
        
    for i in range(n_anomalies):
        features = np.random.randn(10) * 2.0 + 3.0
        events.append(ThreatEvent(
            event_id=f"event_anomaly_{i:03d}",
            timestamp=datetime.now(),
            features=features,
            event_type='unknown_attack',
            metadata={'category': 'potential_zero_day'}
        ))
        
    np.random.shuffle(events)
    
    return events


if __name__ == "__main__":
    print("=" * 80)
    print("Anomaly Detection - Zero-Day Threat Identification")
    print("=" * 80)
    print()
    
    # Initialize detector
    print("Initializing anomaly detector...")
    detector = AnomalyDetector(contamination=0.1, n_estimators=100)
    print("   Detector ready")
    print()
    
    # Generate demo data
    print("Generating demo threat events...")
    training_events = generate_demo_events(n_normal=100, n_anomalies=10)
    print(f"   Generated {len(training_events)} events (90% normal, 10% anomalous)")
    print()
    
    # Train detector
    print("Training anomaly detection model...")
    detector.add_events(training_events)
    detector.train()
    print("   Training complete")
    print()
    
    # Generate test events
    print("🧪 Testing on new events...")
    test_events = generate_demo_events(n_normal=20, n_anomalies=5)
    results = detector.batch_detect(test_events)
    print(f"   ✓ Analyzed {len(test_events)} test events")
    print()
    
    # Display results
    print(f"{'=' * 80}")
    print("Detection Results")
    print(f"{'=' * 80}")
    print()
    
    anomaly_results = [r for r in results if r.is_anomaly]
    normal_results = [r for r in results if not r.is_anomaly]
    
    print(f"📊 Summary:")
    print(f"   Total events: {len(results)}")
    print(f"   Anomalies detected: {len(anomaly_results)}")
    print(f"   Normal events: {len(normal_results)}")
    print(f"   Detection rate: {len(anomaly_results)/len(results)*100:.1f}%")
    print()
    
    if anomaly_results:
        print(f"⚠️  Top Anomalies:")
        sorted_anomalies = sorted(anomaly_results, key=lambda x: x.anomaly_score, reverse=True)
        for i, result in enumerate(sorted_anomalies[:5], 1):
            print(f"\n   {i}. Event ID: {result.event_id}")
            print(f"      Anomaly Score: {result.anomaly_score:.3f}")
            print(f"      Confidence: {result.confidence:.3f}")
            print(f"      {result.explanation}")
            if result.similar_events:
                print(f"      Similar events: {', '.join(result.similar_events[:3])}")
    
    print()
    
    # Statistics
    print("📈 Anomaly Statistics:")
    stats = detector.get_anomaly_statistics()
    for key, value in stats.items():
        if isinstance(value, float):
            print(f"   {key}: {value:.3f}")
        else:
            print(f"   {key}: {value}")
    
    print()
    print("✅ Anomaly detection complete!")
    print("=" * 80)
