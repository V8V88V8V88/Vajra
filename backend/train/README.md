# Model Training with Real-World Data

## Quick Start

### 1. Download Real Datasets
```bash
python backend/train/download_real_datasets.py
```

**Downloads:**
- MITRE ATT&CK (835 techniques, 187 threat groups)
- NVD CVEs (316,000+ vulnerabilities)
- Threat Actor Intelligence
- Malware Family Classifications

### 2. Train Models
```bash
python backend/train/train_models_real_data.py
```

**Trains:**
- Graph Neural Network (GNN) on MITRE data
- NLP Model on CVE descriptions
- LSTM Forecaster on time-series patterns
- Anomaly Detector on threat events

### 3. Verify Training
```bash
ls -lh backend/models/*_real.*
```

## Data Sources

| Source | Records | Authority |
|--------|---------|-----------|
| **MITRE ATT&CK** | 1,022 objects | MITRE Corporation |
| **NVD** | 316,578 CVEs | NIST (U.S. Government) |
| **Threat Actors** | 10 APT groups | Public Intelligence |
| **Malware** | 10 families | Security Research |

## Results

✅ **3/4 models** trained successfully on real data  
✅ **518 KB GNN** model (4x larger than synthetic)  
✅ **983 KB Anomaly Detector** trained on 700 real events  
✅ **1,509 real texts** processed by NLP model

See `backend/REAL_DATA_TRAINING_REPORT.md` for full details.
