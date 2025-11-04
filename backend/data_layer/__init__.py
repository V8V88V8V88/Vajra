"""
Polyglot Data Layer Module
===========================

Hybrid database integration layer for cyber threat intelligence storage.

This module contains:
- Neo4jConnector: Graph database for threat relationships
- VectorDBClient: Vector database for semantic similarity search
- TimeSeriesDBClient: Time-series database for temporal threat data
- FrameworkMapper: MITRE ATT&CK and NIST CSF mapping

Author: AI-Powered Cyber Threat Forecaster Team
Date: November 2025
"""

__version__ = "1.0.0"
__all__ = [
    "Neo4jConnector",
    "VectorDBClient",
    "TimeSeriesDBClient",
    "FrameworkMapper"
]

from .neo4j_connector import Neo4jConnector
from .vector_db import VectorDBClient
from .timeseries_db import TimeSeriesDBClient
from .framework_mapper import FrameworkMapper
