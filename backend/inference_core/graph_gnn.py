"""
GNN-based threat intelligence analyzer.
Tracks relationships between actors, malware, CVEs, and infrastructure.
"""

import logging
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class ThreatNode:
    node_id: str
    node_type: str
    features: np.ndarray
    metadata: Dict


@dataclass
class ThreatEdge:
    source: str
    target: str
    edge_type: str
    weight: float


class GCNLayer(nn.Module):
    def __init__(self, in_features: int, out_features: int):
        super(GCNLayer, self).__init__()
        self.linear = nn.Linear(in_features, out_features)
        
    def forward(self, x: torch.Tensor, adj: torch.Tensor) -> torch.Tensor:
        adj = adj + torch.eye(adj.size(0), device=adj.device)
        
        deg = adj.sum(dim=1)
        deg_inv_sqrt = torch.pow(deg, -0.5)
        deg_inv_sqrt[torch.isinf(deg_inv_sqrt)] = 0.0
        norm = torch.diag(deg_inv_sqrt)
        adj_normalized = norm @ adj @ norm
        
        support = self.linear(x)
        output = adj_normalized @ support
        
        return output


class ThreatGNN(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int, num_layers: int = 3):
        super(ThreatGNN, self).__init__()
        self.num_layers = num_layers
        
        self.layers = nn.ModuleList()
        self.layers.append(GCNLayer(input_dim, hidden_dim))
        
        for _ in range(num_layers - 2):
            self.layers.append(GCNLayer(hidden_dim, hidden_dim))
            
        self.layers.append(GCNLayer(hidden_dim, output_dim))
        self.dropout = nn.Dropout(0.3)
        
    def forward(self, x: torch.Tensor, adj: torch.Tensor) -> torch.Tensor:
        for i, layer in enumerate(self.layers):
            x = layer(x, adj)
            if i < len(self.layers) - 1:
                x = F.relu(x)
                x = self.dropout(x)
                
        return x


class GraphThreatAnalyzer:
    def __init__(self, input_dim: int = 64, hidden_dim: int = 128, output_dim: int = 64):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        
        self.model = ThreatGNN(input_dim, hidden_dim, output_dim)
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        
        self.nodes: Dict[str, ThreatNode] = {}
        self.edges: List[ThreatEdge] = []
        
        logger.info(f"GraphThreatAnalyzer initialized with dims: {input_dim} -> {hidden_dim} -> {output_dim}")
        
    def add_node(self, node: ThreatNode) -> None:
        self.nodes[node.node_id] = node
        logger.debug(f"Added node: {node.node_id} (type: {node.node_type})")
        
    def add_edge(self, edge: ThreatEdge) -> None:
        self.edges.append(edge)
        logger.debug(f"Added edge: {edge.source} -> {edge.target} ({edge.edge_type})")
        
    def build_adjacency_matrix(self) -> torch.Tensor:
        n = len(self.nodes)
        adj = torch.zeros((n, n))
        
        node_id_to_idx = {node_id: idx for idx, node_id in enumerate(self.nodes.keys())}
        
        for edge in self.edges:
            if edge.source in node_id_to_idx and edge.target in node_id_to_idx:
                i = node_id_to_idx[edge.source]
                j = node_id_to_idx[edge.target]
                adj[i, j] = edge.weight
                adj[j, i] = edge.weight
                
        return adj
        
    def build_feature_matrix(self) -> torch.Tensor:
        features = []
        for node in self.nodes.values():
            features.append(node.features)
            
        return torch.FloatTensor(np.array(features))
        
    def analyze(self) -> Dict[str, np.ndarray]:
        logger.info(f"Analyzing threat graph with {len(self.nodes)} nodes and {len(self.edges)} edges")
        
        features = self.build_feature_matrix()
        adj = self.build_adjacency_matrix()
        
        # Move tensors to the same device as the model
        device = next(self.model.parameters()).device
        features = features.to(device)
        adj = adj.to(device)
        
        self.model.eval()
        with torch.no_grad():
            embeddings = self.model(features, adj)
            
        result = {}
        for idx, node_id in enumerate(self.nodes.keys()):
            result[node_id] = embeddings[idx].cpu().numpy()  # Move to CPU before converting to numpy
            
        logger.info("Threat graph analysis complete")
        return result
        
    def compute_threat_scores(self, embeddings: Dict[str, np.ndarray]) -> Dict[str, float]:
        scores = {}
        for node_id, embedding in embeddings.items():
            score = np.linalg.norm(embedding) / (self.output_dim ** 0.5)
            score = min(max(score, 0.0), 1.0)
            scores[node_id] = float(score)
            
        return scores
        
    def find_related_threats(self, node_id: str, embeddings: Dict[str, np.ndarray], 
                           top_k: int = 5) -> List[Tuple[str, float]]:
        if node_id not in embeddings:
            logger.warning(f"Node {node_id} not found in embeddings")
            return []
            
        query_embedding = embeddings[node_id]
        similarities = []
        
        for other_id, other_embedding in embeddings.items():
            if other_id != node_id:
                similarity = np.dot(query_embedding, other_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(other_embedding) + 1e-8
                )
                similarities.append((other_id, float(similarity)))
                
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:top_k]


def create_demo_threat_graph() -> GraphThreatAnalyzer:
    analyzer = GraphThreatAnalyzer(input_dim=32, hidden_dim=64, output_dim=32)
    
    threat_actors = [
        ThreatNode("actor_apt29", "actor", np.random.randn(32), 
                  {"name": "APT29", "origin": "Russia", "sophistication": "high"}),
        ThreatNode("actor_apt28", "actor", np.random.randn(32),
                  {"name": "APT28", "origin": "Russia", "sophistication": "high"}),
        ThreatNode("actor_lazarus", "actor", np.random.randn(32),
                  {"name": "Lazarus Group", "origin": "North Korea", "sophistication": "high"}),
    ]
    
    malware = [
        ThreatNode("malware_cobaltstrike", "malware", np.random.randn(32),
                  {"name": "CobaltStrike", "type": "RAT"}),
        ThreatNode("malware_emotet", "malware", np.random.randn(32),
                  {"name": "Emotet", "type": "Trojan"}),
        ThreatNode("malware_ransomware_x", "malware", np.random.randn(32),
                  {"name": "RansomwareX", "type": "Ransomware"}),
    ]
    
    cves = [
        ThreatNode("cve_2023_12345", "cve", np.random.randn(32),
                  {"id": "CVE-2023-12345", "severity": "critical", "cvss": 9.8}),
        ThreatNode("cve_2023_67890", "cve", np.random.randn(32),
                  {"id": "CVE-2023-67890", "severity": "high", "cvss": 8.5}),
    ]
    
    infrastructure = [
        ThreatNode("infra_c2_server_1", "infrastructure", np.random.randn(32),
                  {"type": "C2 Server", "ip": "192.168.1.100"}),
        ThreatNode("infra_phishing_domain", "infrastructure", np.random.randn(32),
                  {"type": "Phishing Domain", "domain": "fake-bank.com"}),
    ]
    
    for node in threat_actors + malware + cves + infrastructure:
        analyzer.add_node(node)
        
    edges = [
        ThreatEdge("actor_apt29", "malware_cobaltstrike", "uses", 0.9),
        ThreatEdge("actor_apt28", "malware_emotet", "uses", 0.8),
        ThreatEdge("actor_lazarus", "malware_ransomware_x", "uses", 0.95),
        ThreatEdge("malware_cobaltstrike", "cve_2023_12345", "exploits", 0.85),
        ThreatEdge("malware_emotet", "cve_2023_67890", "exploits", 0.75),
        ThreatEdge("actor_apt29", "infra_c2_server_1", "controls", 0.9),
        ThreatEdge("actor_apt28", "infra_phishing_domain", "controls", 0.85),
        ThreatEdge("malware_cobaltstrike", "infra_c2_server_1", "communicates_with", 0.95),
        ThreatEdge("malware_emotet", "infra_phishing_domain", "communicates_with", 0.8),
    ]
    
    for edge in edges:
        analyzer.add_edge(edge)
        
    return analyzer


if __name__ == "__main__":
    print("=" * 80)
    print("Graph Neural Network - Threat Intelligence Analyzer")
    print("=" * 80)
    print()
    
    print("Creating demo threat intelligence graph...")
    analyzer = create_demo_threat_graph()
    print(f"   Created graph with {len(analyzer.nodes)} nodes and {len(analyzer.edges)} edges")
    print()
    
    print("Analyzing threat relationships...")
    embeddings = analyzer.analyze()
    print(f"   Generated embeddings for {len(embeddings)} entities")
    print()
    
    print("Computing threat scores...")
    threat_scores = analyzer.compute_threat_scores(embeddings)
    sorted_threats = sorted(threat_scores.items(), key=lambda x: x[1], reverse=True)
    
    print("   Top 5 highest-risk entities:")
    for i, (node_id, score) in enumerate(sorted_threats[:5], 1):
        node = analyzer.nodes[node_id]
        print(f"   {i}. {node_id} ({node.node_type}): {score:.3f}")
    print()
    
    print("Finding related threats to 'actor_apt29'...")
    related = analyzer.find_related_threats("actor_apt29", embeddings, top_k=5)
    print("   Most related entities:")
    for i, (node_id, similarity) in enumerate(related, 1):
        node = analyzer.nodes[node_id]
        print(f"   {i}. {node_id} ({node.node_type}): similarity={similarity:.3f}")
    print()
    
    print("Graph analysis complete!")
    print("=" * 80)
