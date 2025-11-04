"""
Explainable AI Layer for threat intelligence model interpretability.
"""

import logging
import numpy as np
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    logger.warning("SHAP not available. Using custom explanation methods.")
    SHAP_AVAILABLE = False


@dataclass
class FeatureImportance:
    feature_name: str
    importance: float
    contribution: str


@dataclass
class Explanation:
    prediction: Any
    confidence: float
    feature_importances: List[FeatureImportance]
    natural_language_explanation: str
    recommendation: str
    metadata: Dict[str, Any]


class ExplainableAILayer:
    
    def __init__(self, feature_names: Optional[List[str]] = None):
        self.feature_names = feature_names or []
        
        self.shap_explainer = None
        if SHAP_AVAILABLE:
            logger.info("SHAP explainer will be initialized with model")
        else:
            logger.info("Using custom explanation methods")
            
        self.threat_templates = {
            'high_risk': "HIGH RISK: {reason}. Immediate action recommended.",
            'medium_risk': "MEDIUM RISK: {reason}. Monitor closely and prepare response.",
            'low_risk': "LOW RISK: {reason}. Continue routine monitoring.",
            'anomaly': "ANOMALY DETECTED: {reason}. Requires investigation.",
            'attack': "ATTACK DETECTED: {reason}. Activate incident response.",
        }
        
    def set_feature_names(self, feature_names: List[str]) -> None:
        self.feature_names = feature_names
        logger.debug(f"Updated feature names: {len(feature_names)} features")
        
    def initialize_shap(self, model: Any, background_data: np.ndarray) -> None:
        if not SHAP_AVAILABLE:
            logger.warning("SHAP not available, skipping initialization")
            return
            
        try:
            logger.info("Initializing SHAP explainer...")
            if hasattr(model, 'predict_proba'):
                self.shap_explainer = shap.Explainer(model, background_data)
            elif hasattr(model, 'predict'):
                self.shap_explainer = shap.Explainer(model, background_data)
            else:
                self.shap_explainer = shap.KernelExplainer(model, background_data)
                
            logger.info("SHAP explainer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize SHAP: {e}")
            self.shap_explainer = None
            
    def explain_with_shap(self, instance: np.ndarray) -> List[FeatureImportance]:
        if not SHAP_AVAILABLE or self.shap_explainer is None:
            raise ValueError("SHAP explainer not available")
            
        try:
            shap_values = self.shap_explainer(instance.reshape(1, -1))
            
            if hasattr(shap_values, 'values'):
                values = shap_values.values[0]
            else:
                values = shap_values[0]
                
            importances = []
            for i, value in enumerate(values):
                feature_name = self.feature_names[i] if i < len(self.feature_names) else f"feature_{i}"
                importances.append(FeatureImportance(
                    feature_name=feature_name,
                    importance=abs(float(value)),
                    contribution='positive' if value > 0 else 'negative'
                ))
                
            importances.sort(key=lambda x: x.importance, reverse=True)
            
            return importances
            
        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}")
            return self.explain_with_gradient(instance)
            
    def explain_with_gradient(self, instance: np.ndarray, 
                             model: Optional[Any] = None) -> List[FeatureImportance]:
        importances = []
        
        for i, value in enumerate(instance):
            feature_name = self.feature_names[i] if i < len(self.feature_names) else f"feature_{i}"
            importance = abs(float(value))
            contribution = 'positive' if value > 0 else 'negative'
            
            importances.append(FeatureImportance(
                feature_name=feature_name,
                importance=importance,
                contribution=contribution
            ))
            
        importances.sort(key=lambda x: x.importance, reverse=True)
        
        return importances
        
    def explain_prediction(self, 
                          instance: np.ndarray,
                          prediction: Any,
                          confidence: float,
                          prediction_type: str = 'risk_score',
                          context: Optional[Dict[str, Any]] = None) -> Explanation:
        """
        Generate complete explanation for a prediction.
        
        Args:
            instance: Input features
            prediction: Model prediction
            confidence: Prediction confidence
            prediction_type: Type of prediction ('risk_score', 'classification', 'anomaly')
            context: Additional context information
            
        Returns:
            Complete explanation object
        """
        logger.info(f"Generating explanation for {prediction_type} prediction...")
        
        # Get feature importances
        if SHAP_AVAILABLE and self.shap_explainer is not None:
            importances = self.explain_with_shap(instance)
        else:
            importances = self.explain_with_gradient(instance)
            
        # Generate natural language explanation
        nl_explanation = self._generate_natural_language(
            prediction, confidence, importances, prediction_type, context
        )
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            prediction, confidence, importances, prediction_type
        )
        
        # Compile metadata
        metadata = {
            'prediction_type': prediction_type,
            'timestamp': str(np.datetime64('now')),
            'num_features': len(instance),
            'top_features': [imp.feature_name for imp in importances[:5]]
        }
        if context:
            metadata.update(context)
            
        explanation = Explanation(
            prediction=prediction,
            confidence=confidence,
            feature_importances=importances,
            natural_language_explanation=nl_explanation,
            recommendation=recommendation,
            metadata=metadata
        )
        
        logger.info("Explanation generated successfully")
        return explanation
        
    def _generate_natural_language(self, 
                                   prediction: Any,
                                   confidence: float,
                                   importances: List[FeatureImportance],
                                   prediction_type: str,
                                   context: Optional[Dict[str, Any]]) -> str:
        """Generate natural language explanation."""
        
        # Extract top features
        top_features = importances[:3]
        
        if prediction_type == 'risk_score':
            risk_level = 'high' if prediction > 0.7 else 'medium' if prediction > 0.4 else 'low'
            
            explanation = f"The threat risk score is {prediction:.3f} ({risk_level} risk). "
            
            if top_features:
                explanation += f"This assessment is primarily driven by: "
                factors = []
                for feat in top_features:
                    direction = "elevating" if feat.contribution == 'positive' else "reducing"
                    factors.append(f"{feat.feature_name} ({direction} risk)")
                explanation += ", ".join(factors) + ". "
                
            explanation += f"Confidence in this assessment: {confidence:.1%}."
            
        elif prediction_type == 'classification':
            explanation = f"Classified as: {prediction} (confidence: {confidence:.1%}). "
            
            if top_features:
                explanation += f"Key indicators: "
                explanation += ", ".join([f.feature_name for f in top_features]) + ". "
                
        elif prediction_type == 'anomaly':
            if prediction:
                explanation = "Anomalous behavior detected. "
                if top_features:
                    explanation += f"Unusual patterns observed in: "
                    explanation += ", ".join([f.feature_name for f in top_features]) + ". "
                explanation += f"Anomaly confidence: {confidence:.1%}."
            else:
                explanation = f"Normal behavior detected (confidence: {confidence:.1%})."
                
        else:
            explanation = f"Prediction: {prediction}, Confidence: {confidence:.1%}. "
            
        # Add context if available
        if context:
            if 'threat_actor' in context:
                explanation += f" Associated with threat actor: {context['threat_actor']}."
            if 'attack_vector' in context:
                explanation += f" Attack vector: {context['attack_vector']}."
                
        return explanation
        
    def _generate_recommendation(self,
                                prediction: Any,
                                confidence: float,
                                importances: List[FeatureImportance],
                                prediction_type: str) -> str:
        """Generate actionable recommendations."""
        
        if prediction_type == 'risk_score':
            risk_level = 'high' if prediction > 0.7 else 'medium' if prediction > 0.4 else 'low'
            
            if risk_level == 'high':
                return ("IMMEDIATE ACTION REQUIRED: "
                       "1) Alert security team, "
                       "2) Isolate affected systems, "
                       "3) Begin incident response procedures, "
                       "4) Collect forensic evidence.")
            elif risk_level == 'medium':
                return ("INCREASED MONITORING: "
                       "1) Enhance logging and monitoring, "
                       "2) Review access controls, "
                       "3) Prepare incident response team, "
                       "4) Update threat indicators.")
            else:
                return ("ROUTINE MONITORING: "
                       "1) Continue normal security operations, "
                       "2) Maintain regular log reviews, "
                       "3) Keep systems updated.")
                       
        elif prediction_type == 'anomaly':
            if prediction:
                return ("INVESTIGATION REQUIRED: "
                       "1) Analyze anomalous patterns, "
                       "2) Check for IOCs (Indicators of Compromise), "
                       "3) Correlate with other security events, "
                       "4) Consider threat hunting activities.")
            else:
                return "No action needed. Continue monitoring."
                
        elif prediction_type == 'classification':
            return ("📋 RESPONSE ACTIONS: "
                   f"1) Follow playbook for {prediction}, "
                   "2) Document incident details, "
                   "3) Notify stakeholders as needed, "
                   "4) Update threat intelligence database.")
                   
        return "Review prediction and take appropriate action based on your security policies."
        
    def generate_report(self, explanation: Explanation, format: str = 'text') -> str:
        """
        Generate a formatted report from explanation.
        
        Args:
            explanation: Explanation object
            format: Output format ('text', 'json', 'html')
            
        Returns:
            Formatted report string
        """
        if format == 'json':
            return json.dumps({
                'prediction': str(explanation.prediction),
                'confidence': explanation.confidence,
                'explanation': explanation.natural_language_explanation,
                'recommendation': explanation.recommendation,
                'top_features': [
                    {
                        'name': imp.feature_name,
                        'importance': imp.importance,
                        'contribution': imp.contribution
                    }
                    for imp in explanation.feature_importances[:10]
                ],
                'metadata': explanation.metadata
            }, indent=2)
            
        elif format == 'html':
            html = f"""
            <div class="threat-explanation">
                <h2>Threat Analysis Report</h2>
                <p><strong>Prediction:</strong> {explanation.prediction}</p>
                <p><strong>Confidence:</strong> {explanation.confidence:.1%}</p>
                <h3>Explanation</h3>
                <p>{explanation.natural_language_explanation}</p>
                <h3>Recommendations</h3>
                <p>{explanation.recommendation}</p>
                <h3>Key Features</h3>
                <ul>
            """
            for imp in explanation.feature_importances[:5]:
                html += f"<li>{imp.feature_name}: {imp.importance:.3f} ({imp.contribution})</li>\n"
            html += "</ul></div>"
            return html
            
        else:  # text format
            report = "=" * 80 + "\n"
            report += "THREAT INTELLIGENCE ANALYSIS REPORT\n"
            report += "=" * 80 + "\n\n"
            report += f"Prediction: {explanation.prediction}\n"
            report += f"Confidence: {explanation.confidence:.1%}\n\n"
            report += "EXPLANATION:\n"
            report += "-" * 80 + "\n"
            report += explanation.natural_language_explanation + "\n\n"
            report += "RECOMMENDATIONS:\n"
            report += "-" * 80 + "\n"
            report += explanation.recommendation + "\n\n"
            report += "TOP CONTRIBUTING FACTORS:\n"
            report += "-" * 80 + "\n"
            for i, imp in enumerate(explanation.feature_importances[:10], 1):
                report += f"{i:2d}. {imp.feature_name:30s} "
                report += f"Importance: {imp.importance:6.3f} "
                report += f"({imp.contribution})\n"
            report += "\n" + "=" * 80 + "\n"
            return report


if __name__ == "__main__":
    print("=" * 80)
    print("Explainable AI Layer - Model Interpretability")
    print("=" * 80)
    print()
    
    # Initialize explainer
    print("🧠 Initializing Explainable AI layer...")
    feature_names = [
        'attack_frequency', 'vulnerability_count', 'malware_signatures',
        'network_anomalies', 'failed_logins', 'data_exfiltration',
        'lateral_movement', 'privilege_escalation', 'persistence_mechanisms',
        'c2_communications'
    ]
    explainer = ExplainableAILayer(feature_names=feature_names)
    print("   Explainer ready")
    print()
    
    # Create demo scenarios
    scenarios = [
        {
            'name': 'High-Risk APT Attack',
            'features': np.array([0.9, 0.8, 0.85, 0.75, 0.7, 0.8, 0.9, 0.85, 0.9, 0.95]),
            'prediction': 0.89,
            'confidence': 0.92,
            'type': 'risk_score',
            'context': {'threat_actor': 'APT29', 'attack_vector': 'spear_phishing'}
        },
        {
            'name': 'Medium-Risk Reconnaissance',
            'features': np.array([0.4, 0.3, 0.2, 0.6, 0.5, 0.1, 0.2, 0.1, 0.1, 0.3]),
            'prediction': 0.52,
            'confidence': 0.78,
            'type': 'risk_score',
            'context': {'attack_vector': 'network_scanning'}
        },
        {
            'name': 'Anomalous Behavior Detected',
            'features': np.array([0.3, 0.2, 0.1, 0.95, 0.4, 0.3, 0.2, 0.8, 0.1, 0.2]),
            'prediction': True,
            'confidence': 0.86,
            'type': 'anomaly',
            'context': {}
        },
    ]
    
    print("Analyzing threat scenarios...\n")
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"{'=' * 80}")
        print(f"Scenario {i}: {scenario['name']}")
        print(f"{'=' * 80}")
        
        # Generate explanation
        explanation = explainer.explain_prediction(
            instance=scenario['features'],
            prediction=scenario['prediction'],
            confidence=scenario['confidence'],
            prediction_type=scenario['type'],
            context=scenario['context']
        )
        
        # Display text report
        report = explainer.generate_report(explanation, format='text')
        print(report)
        
    # Demonstrate JSON output
    print("\n" + "=" * 80)
    print("JSON Report Example")
    print("=" * 80)
    json_report = explainer.generate_report(explanation, format='json')
    print(json_report)
    print()
    
    print("Explainable AI demonstrations complete!")
    print("=" * 80)
