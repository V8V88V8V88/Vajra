"""Generate synthetic training data for all inference_core modules."""
import json
import random
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

OUTPUT_DIR = Path(__file__).parent / "data"
OUTPUT_DIR.mkdir(exist_ok=True)

THREAT_TYPES = ["malware", "phishing", "ddos", "ransomware", "apt", "zero_day"]
ACTORS = ["APT28", "Lazarus", "FIN7", "Unknown", "Script Kiddie"]
CVE_LIST = ["CVE-2023-1234", "CVE-2023-5678", "CVE-2024-0001", "CVE-2024-0002"]


def generate_graph_data(num_nodes=500, num_edges=1500):
    print("Generating graph data...")
    nodes = []
    for i in range(num_nodes):
        nodes.append({
            "id": f"node_{i}",
            "type": random.choice(["threat", "actor", "cve", "infrastructure"]),
            "features": np.random.randn(64).tolist(),
            "label": random.choice([0, 1]),
        })
    
    edges = []
    for _ in range(num_edges):
        src = random.randint(0, num_nodes - 1)
        dst = random.randint(0, num_nodes - 1)
        if src != dst:
            edges.append({
                "source": f"node_{src}",
                "target": f"node_{dst}",
                "relation": random.choice(["uses", "targets", "originates_from", "exploits"])
            })
    
    graph_data = {"nodes": nodes, "edges": edges}
    output_path = OUTPUT_DIR / "graph_data.json"
    with open(output_path, "w") as f:
        json.dump(graph_data, f, indent=2)
    print(f"Graph data saved to {output_path}")
    return graph_data


def generate_nlp_data(num_samples=1000):
    print("Generating NLP text data...")
    templates = [
        "New {threat} campaign detected targeting {sector} sector using {technique}",
        "{actor} group launches {threat} attack exploiting {cve}",
        "Critical vulnerability {cve} discovered in {software}, enabling {threat}",
        "Phishing campaign impersonating {brand} to deliver {malware}",
        "DDoS attack detected from botnet infrastructure associated with {actor}",
        "Ransomware variant {malware} spreads via {vector}",
        "Zero-day exploit {cve} actively used by {actor} APT group",
    ]
    
    sectors = ["financial", "healthcare", "energy", "government", "retail"]
    techniques = ["spear phishing", "watering hole", "supply chain", "credential stuffing"]
    software = ["Apache", "OpenSSL", "WordPress", "Microsoft Exchange"]
    brands = ["PayPal", "Amazon", "Microsoft", "Google"]
    malware_names = ["LockBit", "Emotet", "TrickBot", "BlackCat"]
    vectors = ["malicious email attachments", "RDP exploitation", "VPN vulnerabilities"]
    
    samples = []
    for i in range(num_samples):
        template = random.choice(templates)
        text = template.format(
            threat=random.choice(THREAT_TYPES),
            actor=random.choice(ACTORS),
            cve=random.choice(CVE_LIST),
            sector=random.choice(sectors),
            technique=random.choice(techniques),
            software=random.choice(software),
            brand=random.choice(brands),
            malware=random.choice(malware_names),
            vector=random.choice(vectors)
        )
        
        # Assign sentiment and risk
        sentiment = random.choice(["negative", "neutral", "critical"])
        risk_score = random.uniform(0.3, 1.0) if sentiment == "critical" else random.uniform(0.1, 0.6)
        
        samples.append({
            "id": i,
            "text": text,
            "sentiment": sentiment,
            "risk_score": risk_score,
            "entities": {
                "cves": [c for c in CVE_LIST if c in text],
                "actors": [a for a in ACTORS if a in text],
                "threats": [t for t in THREAT_TYPES if t in text]
            }
        })
    
    output_path = OUTPUT_DIR / "nlp_data.json"
    with open(output_path, "w") as f:
        json.dump(samples, f, indent=2)
    print(f"NLP data saved to {output_path}")
    return samples


def generate_timeseries_data(num_sequences=200, sequence_length=30):
    """Generate synthetic time-series data for LSTM forecasting."""
    print("Generating time-series data...")
    sequences = []
    
    for i in range(num_sequences):
        # Create synthetic threat activity over time
        base_level = random.uniform(10, 50)
        trend = random.choice([-0.5, 0, 0.5, 1.0])  # decreasing, stable, increasing, rapidly increasing
        noise = np.random.randn(sequence_length) * 5
        
        series = []
        for t in range(sequence_length):
            value = base_level + (trend * t) + noise[t]
            value = max(0, value)  # no negative threat counts
            series.append(float(value))
        
        # Add future target (next 7 days)
        future_values = []
        for t in range(7):
            future_val = base_level + (trend * (sequence_length + t)) + random.gauss(0, 5)
            future_values.append(max(0, float(future_val)))
        
        sequences.append({
            "id": i,
            "historical": series,
            "future": future_values,
            "trend": "increasing" if trend > 0.3 else "stable" if abs(trend) < 0.3 else "decreasing",
            "threat_type": random.choice(THREAT_TYPES)
        })
    
    output_path = OUTPUT_DIR / "timeseries_data.json"
    with open(output_path, "w") as f:
        json.dump(sequences, f, indent=2)
    print(f"Time-series data saved to {output_path}")
    return sequences


def generate_anomaly_data(num_normal=800, num_anomalies=200):
    """Generate normal and anomalous samples for anomaly detection."""
    print("Generating anomaly detection data...")
    
    # Normal samples: low dimensionality, clustered
    normal_samples = []
    for i in range(num_normal):
        center = np.random.choice([0, 10, 20])  # 3 clusters
        features = np.random.randn(20) * 2 + center
        normal_samples.append({
            "id": f"normal_{i}",
            "features": features.tolist(),
            "label": 0,  # normal
            "type": "normal_traffic"
        })
    
    # Anomalous samples: outliers
    anomaly_samples = []
    for i in range(num_anomalies):
        # Create outliers far from clusters
        features = np.random.randn(20) * 10 + random.choice([-50, 50])
        anomaly_samples.append({
            "id": f"anomaly_{i}",
            "features": features.tolist(),
            "label": 1,  # anomaly
            "type": random.choice(["zero_day", "novel_attack", "suspicious_behavior"])
        })
    
    all_samples = normal_samples + anomaly_samples
    random.shuffle(all_samples)
    
    output_path = OUTPUT_DIR / "anomaly_data.json"
    with open(output_path, "w") as f:
        json.dump(all_samples, f, indent=2)
    print(f"Anomaly data saved to {output_path}")
    return all_samples


def main():
    print("=" * 70)
    print("GENERATING TRAINING DATA FOR ALL MODULES")
    print("=" * 70)
    
    generate_graph_data()
    generate_nlp_data()
    generate_timeseries_data()
    generate_anomaly_data()
    
    print("\n" + "=" * 70)
    print("ALL TRAINING DATA GENERATED SUCCESSFULLY")
    print(f"Data location: {OUTPUT_DIR.absolute()}")
    print("=" * 70)


if __name__ == "__main__":
    main()
