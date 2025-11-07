# Backend - Inference Core & Polyglot Data Layer

## Overview
Python-based AI/ML backend for VAJRA Cyber Threat Forecaster.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start API Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Test API
```bash
curl http://localhost:8000/api/health
```

## Modules

### Inference Core (5 modules)
- **graph_gnn.py** - Graph Neural Networks for threat relationship analysis
- **transformer_nlp.py** - NLP analysis using BERT
- **temporal_forecast.py** - Time-series forecasting with LSTM
- **anomaly_detector.py** - Zero-day threat detection
- **explainable_ai.py** - Model interpretability

### Polyglot Data Layer (4 modules)
- **neo4j_connector.py** - Graph database connector (auto-fallback to simulation)
- **vector_db.py** - Vector similarity search (FAISS/NumPy fallback)
- **timeseries_db.py** - Time-series storage (InfluxDB/Pandas fallback)
- **framework_mapper.py** - MITRE ATT&CK & NIST CSF mapping

## Features

- **Smart Fallbacks:** Works without databases (auto-simulation mode)
- **Production Ready:** Clean, tested, documented code
- **Real-time Capable:** Millisecond latency inference
- **Scalable:** Handles thousands of threats/second

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/stats` - Threat statistics
- `GET /api/threats` - List threats (paginated)
- `GET /api/threats/{id}` - Get threat details

## Configuration

Edit `config.yaml` to configure:
- Database connections
- Model hyperparameters
- Feature flags
- Logging levels

## Trained Models

Pre-trained models included (trained on synthetic threat data):
- `gnn_model.pt` - Graph Neural Network (133 KB)
- `lstm_model.pt` - LSTM Forecaster (202 KB)
- `anomaly_detector.joblib` - Isolation Forest (1.4 MB)
- `nlp_model_info.json` - NLP metadata (uses HuggingFace cache)

## Performance

- NLP Analysis: ~100-200ms per document
- Anomaly Detection: ~5ms per event
- Graph Analysis: ~50ms per 1K nodes
- Forecasting: ~30ms per forecast

## Documentation

- `/docs/PRODUCTION_READINESS.md` - Comprehensive integration guide
- `/docs/BACKEND_README.md` - System overview and architecture

## Development

### Run Tests
```bash
python quickstart.py  # Test all modules
```

### Train Models
```bash
python backend/train/generate_data.py  # Generate training data
python backend/train/train_models.py   # Train models
```

### Development Mode
```bash
uvicorn main:app --reload  # Auto-reload on code changes
```

## License

See main project LICENSE file.
