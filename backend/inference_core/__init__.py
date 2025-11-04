"""
Inference Core Module
======================

AI/ML engine for cyber threat intelligence analysis.

This module contains:
- GraphThreatAnalyzer: Graph Neural Network for threat relationship analysis
- ThreatChatterNLP: Transformer-based NLP for dark web chatter analysis
- ThreatForecaster: Temporal models for threat trend prediction
- AnomalyDetector: Unsupervised anomaly detection for zero-day threats
- ExplainableAILayer: Model interpretability using SHAP/LIME

Author: AI-Powered Cyber Threat Forecaster Team
Date: November 2025
"""

__version__ = "1.0.0"
__all__ = [
    "GraphThreatAnalyzer",
    "ThreatChatterNLP",
    "ThreatForecaster",
    "AnomalyDetector",
    "ExplainableAILayer"
]

from .graph_gnn import GraphThreatAnalyzer
from .transformer_nlp import ThreatChatterNLP
from .temporal_forecast import ThreatForecaster
from .anomaly_detector import AnomalyDetector
from .explainable_ai import ExplainableAILayer
