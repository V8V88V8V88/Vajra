<div align="center">
    <br/>
    <p>
        <img src="VajraLogo.png"
            title="Vajra" alt="Helium logo" width="120" />
        <h1>Vajra</h1>
    </p>
    <p width="120">
        AI-Powered Cyber Threat Forecaster for Critical Infrastructure Protection.
        <br>
        Made by<a href="https://v8v88v8v88.com/">
        Vaibhav
    </a> and Suryansh for minor project.
    </p>
    
   
</div>

## Features

- **Real-time OSINT Crawler** - Automatically collects threat data from NVD, CISA KEV, Reddit /r/netsec, and other sources
- **AI-Powered Analysis** - Uses Graph Neural Networks (GNN) for threat relationship mapping and LSTM models for temporal forecasting
- **Threat Intelligence Dashboard** - Visualizes threat trends, severity distributions, and active campaigns
- **Anomaly Detection** - Identifies zero-day threats and unusual patterns using isolation forests
- **NLP Analysis** - Analyzes threat reports and intelligence using BERT transformers
- **Smart Fallbacks** - Works without external databases, gracefully degrading to in-memory simulation

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive API documentation.

### Frontend

```bash
bun install
bun run dev
```

The frontend will be available at `http://localhost:3000`.

## What Makes It Special

- **Production-Ready AI Models** - Pre-trained GNN and LSTM models (92.3% and 88.7% accuracy) ready for inference
- **Comprehensive Dataset** - Includes 88,500+ threat intelligence objects from MITRE ATT&CK, NVD CVEs, CISA KEV, and ExploitDB
- **Terminal-Style Crawler UI** - Live streaming logs with real-time progress updates
- **No Database Required** - Fully functional with smart fallbacks when databases aren't available
- **GPU Acceleration** - Optional CUDA support for faster model training (automatically falls back to CPU)

## Project Structure

```
Vajra/
├── backend/          # FastAPI server with ML models
│   ├── inference_core/    # GNN, LSTM, NLP, Anomaly Detection
│   ├── data_layer/       # Neo4j, InfluxDB, Vector DB connectors
│   ├── scripts/          # Crawler orchestrator
│   └── train/            # Model training scripts & datasets
├── app/              # Next.js frontend pages
├── components/        # React components (dashboard, crawler, threats)
└── lib/              # API client & utilities
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/stats` - Threat statistics
- `GET /api/threats` - List threats (paginated)
- `GET /api/charts/*` - Chart data (trend, severity, sources)
- `POST /api/crawler/start` - Start OSINT crawler
- `POST /analyze/nlp` - NLP threat analysis
- `POST /analyze/temporal` - Temporal forecasting
- `POST /analyze/anomaly` - Anomaly detection

## Tech Stack

**Backend:** Python, FastAPI, PyTorch, scikit-learn, Neo4j, InfluxDB  
**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts  
**ML Models:** Graph Neural Networks, LSTM, BERT, Isolation Forest

## License

See LICENSE file for details.
