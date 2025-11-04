"""Neo4j connector for threat intelligence graph storage."""

import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    from neo4j import GraphDatabase
    from neo4j.exceptions import ServiceUnavailable, AuthError
    NEO4J_AVAILABLE = True
except ImportError:
    logger.warning("Neo4j driver not available. Using in-memory simulation.")
    NEO4J_AVAILABLE = False


@dataclass
class ThreatNode:
    node_id: str
    node_type: str
    properties: Dict[str, Any]


@dataclass
class ThreatRelationship:
    source_id: str
    target_id: str
    relationship_type: str
    properties: Dict[str, Any]


class Neo4jConnector:
    def __init__(self, uri: str = "bolt://localhost:7687", 
                 user: str = "neo4j", 
                 password: str = "password"):
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = None
        self.connected = False
        
        self.nodes: Dict[str, ThreatNode] = {}
        self.relationships: List[ThreatRelationship] = []
        
        if NEO4J_AVAILABLE:
            try:
                self._connect()
            except Exception as e:
                logger.warning(f"Could not connect to Neo4j: {e}. Using simulation mode.")
                self.simulation_mode = True
        else:
            logger.info("Neo4j driver not available. Using simulation mode.")
            self.simulation_mode = True
            
    def _connect(self) -> None:
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            with self.driver.session() as session:
                session.run("RETURN 1")
            self.connected = True
            self.simulation_mode = False
            logger.info(f"Connected to Neo4j at {self.uri}")
        except (ServiceUnavailable, AuthError) as e:
            logger.error(f"Neo4j connection failed: {e}")
            self.simulation_mode = True
            
    def close(self) -> None:
        """Close the Neo4j connection."""
        if self.driver:
            self.driver.close()
            self.connected = False
            logger.info("Neo4j connection closed")
            
    def create_node(self, node: ThreatNode) -> bool:
        """
        Create a node in the graph.
        
        Args:
            node: ThreatNode to create
            
        Returns:
            True if successful
        """
        if self.simulation_mode:
            self.nodes[node.node_id] = node
            logger.debug(f"Created node (sim): {node.node_id}")
            return True
            
        try:
            with self.driver.session() as session:
                query = f"""
                CREATE (n:{node.node_type} {{node_id: $node_id}})
                SET n += $properties
                RETURN n
                """
                session.run(query, node_id=node.node_id, properties=node.properties)
                logger.debug(f"Created node: {node.node_id}")
                return True
        except Exception as e:
            logger.error(f"Failed to create node: {e}")
            return False
            
    def create_relationship(self, rel: ThreatRelationship) -> bool:
        """
        Create a relationship between nodes.
        
        Args:
            rel: ThreatRelationship to create
            
        Returns:
            True if successful
        """
        if self.simulation_mode:
            self.relationships.append(rel)
            logger.debug(f"Created relationship (sim): {rel.source_id} -> {rel.target_id}")
            return True
            
        try:
            with self.driver.session() as session:
                query = f"""
                MATCH (a {{node_id: $source_id}})
                MATCH (b {{node_id: $target_id}})
                CREATE (a)-[r:{rel.relationship_type}]->(b)
                SET r += $properties
                RETURN r
                """
                session.run(query, 
                          source_id=rel.source_id,
                          target_id=rel.target_id,
                          properties=rel.properties)
                logger.debug(f"Created relationship: {rel.source_id} -{rel.relationship_type}-> {rel.target_id}")
                return True
        except Exception as e:
            logger.error(f"Failed to create relationship: {e}")
            return False
            
    def get_node(self, node_id: str) -> Optional[ThreatNode]:
        """
        Retrieve a node by ID.
        
        Args:
            node_id: ID of the node to retrieve
            
        Returns:
            ThreatNode if found, None otherwise
        """
        if self.simulation_mode:
            return self.nodes.get(node_id)
            
        try:
            with self.driver.session() as session:
                query = """
                MATCH (n {node_id: $node_id})
                RETURN n, labels(n) as labels
                """
                result = session.run(query, node_id=node_id)
                record = result.single()
                
                if record:
                    node = record['n']
                    labels = record['labels']
                    return ThreatNode(
                        node_id=node['node_id'],
                        node_type=labels[0] if labels else 'Unknown',
                        properties=dict(node)
                    )
                return None
        except Exception as e:
            logger.error(f"Failed to get node: {e}")
            return None
            
    def find_related_nodes(self, node_id: str, 
                          relationship_type: Optional[str] = None,
                          max_depth: int = 1) -> List[ThreatNode]:
        """
        Find nodes related to a given node.
        
        Args:
            node_id: ID of the starting node
            relationship_type: Filter by relationship type (optional)
            max_depth: Maximum traversal depth
            
        Returns:
            List of related ThreatNodes
        """
        if self.simulation_mode:
            related = []
            for rel in self.relationships:
                if rel.source_id == node_id:
                    if relationship_type is None or rel.relationship_type == relationship_type:
                        if rel.target_id in self.nodes:
                            related.append(self.nodes[rel.target_id])
            return related
            
        try:
            with self.driver.session() as session:
                rel_filter = f":{relationship_type}" if relationship_type else ""
                query = f"""
                MATCH (start {{node_id: $node_id}})-[r{rel_filter}*1..{max_depth}]-(related)
                RETURN DISTINCT related, labels(related) as labels
                LIMIT 100
                """
                result = session.run(query, node_id=node_id)
                
                related_nodes = []
                for record in result:
                    node = record['related']
                    labels = record['labels']
                    related_nodes.append(ThreatNode(
                        node_id=node.get('node_id', 'unknown'),
                        node_type=labels[0] if labels else 'Unknown',
                        properties=dict(node)
                    ))
                    
                return related_nodes
        except Exception as e:
            logger.error(f"Failed to find related nodes: {e}")
            return []
            
    def find_attack_paths(self, source_id: str, target_id: str,
                         max_length: int = 5) -> List[List[str]]:
        """
        Find attack paths between two nodes.
        
        Args:
            source_id: Starting node ID
            target_id: Target node ID
            max_length: Maximum path length
            
        Returns:
            List of paths (each path is a list of node IDs)
        """
        if self.simulation_mode:
            # Simple BFS for simulation
            paths = []
            visited = set()
            queue = [([source_id], set([source_id]))]
            
            while queue and len(paths) < 10:
                path, visited_in_path = queue.pop(0)
                current = path[-1]
                
                if current == target_id:
                    paths.append(path)
                    continue
                    
                if len(path) >= max_length:
                    continue
                    
                for rel in self.relationships:
                    if rel.source_id == current and rel.target_id not in visited_in_path:
                        new_path = path + [rel.target_id]
                        new_visited = visited_in_path | {rel.target_id}
                        queue.append((new_path, new_visited))
                        
            return paths
            
        try:
            with self.driver.session() as session:
                query = """
                MATCH path = (start {node_id: $source_id})-[*1..%d]-(end {node_id: $target_id})
                RETURN [node IN nodes(path) | node.node_id] as path
                LIMIT 10
                """ % max_length
                
                result = session.run(query, source_id=source_id, target_id=target_id)
                
                paths = []
                for record in result:
                    paths.append(record['path'])
                    
                return paths
        except Exception as e:
            logger.error(f"Failed to find attack paths: {e}")
            return []
            
    def get_threat_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about the threat graph.
        
        Returns:
            Dictionary with graph statistics
        """
        if self.simulation_mode:
            node_types = {}
            for node in self.nodes.values():
                node_types[node.node_type] = node_types.get(node.node_type, 0) + 1
                
            rel_types = {}
            for rel in self.relationships:
                rel_types[rel.relationship_type] = rel_types.get(rel.relationship_type, 0) + 1
                
            return {
                'total_nodes': len(self.nodes),
                'total_relationships': len(self.relationships),
                'node_types': node_types,
                'relationship_types': rel_types
            }
            
        try:
            with self.driver.session() as session:
                # Count nodes
                node_count = session.run("MATCH (n) RETURN count(n) as count").single()['count']
                
                # Count relationships
                rel_count = session.run("MATCH ()-[r]->() RETURN count(r) as count").single()['count']
                
                # Node types
                node_types_result = session.run("""
                    MATCH (n)
                    RETURN labels(n)[0] as type, count(*) as count
                """)
                node_types = {record['type']: record['count'] for record in node_types_result}
                
                # Relationship types
                rel_types_result = session.run("""
                    MATCH ()-[r]->()
                    RETURN type(r) as type, count(*) as count
                """)
                rel_types = {record['type']: record['count'] for record in rel_types_result}
                
                return {
                    'total_nodes': node_count,
                    'total_relationships': rel_count,
                    'node_types': node_types,
                    'relationship_types': rel_types
                }
        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
            return {}
            
    def clear_database(self) -> bool:
        """
        Clear all data from the database (use with caution!).
        
        Returns:
            True if successful
        """
        if self.simulation_mode:
            self.nodes.clear()
            self.relationships.clear()
            logger.info("Cleared simulation database")
            return True
            
        try:
            with self.driver.session() as session:
                session.run("MATCH (n) DETACH DELETE n")
                logger.warning("Cleared Neo4j database")
                return True
        except Exception as e:
            logger.error(f"Failed to clear database: {e}")
            return False


def create_demo_graph(connector: Neo4jConnector) -> None:
    """Create a demo threat intelligence graph."""
    
    # Create threat actors
    actors = [
        ThreatNode("APT29", "ThreatActor", {
            "name": "APT29", "aka": "Cozy Bear", "origin": "Russia",
            "sophistication": "high", "active_since": "2008"
        }),
        ThreatNode("APT28", "ThreatActor", {
            "name": "APT28", "aka": "Fancy Bear", "origin": "Russia",
            "sophistication": "high", "active_since": "2007"
        }),
        ThreatNode("Lazarus", "ThreatActor", {
            "name": "Lazarus Group", "origin": "North Korea",
            "sophistication": "high", "active_since": "2009"
        }),
    ]
    
    # Create malware
    malware = [
        ThreatNode("CobaltStrike", "Malware", {
            "name": "Cobalt Strike", "type": "RAT", "platform": "Windows"
        }),
        ThreatNode("Emotet", "Malware", {
            "name": "Emotet", "type": "Trojan", "platform": "Windows"
        }),
        ThreatNode("WannaCry", "Malware", {
            "name": "WannaCry", "type": "Ransomware", "platform": "Windows"
        }),
    ]
    
    # Create CVEs
    cves = [
        ThreatNode("CVE-2023-12345", "Vulnerability", {
            "cve_id": "CVE-2023-12345", "severity": "critical",
            "cvss": 9.8, "description": "Remote Code Execution"
        }),
        ThreatNode("CVE-2023-67890", "Vulnerability", {
            "cve_id": "CVE-2023-67890", "severity": "high",
            "cvss": 8.5, "description": "Privilege Escalation"
        }),
    ]
    
    # Create infrastructure
    infrastructure = [
        ThreatNode("C2-Server-Alpha", "Infrastructure", {
            "type": "C2 Server", "ip": "192.168.1.100", "status": "active"
        }),
        ThreatNode("Phishing-Domain-1", "Infrastructure", {
            "type": "Phishing Domain", "domain": "secure-bank-login.com", "status": "active"
        }),
    ]
    
    # Create all nodes
    for node in actors + malware + cves + infrastructure:
        connector.create_node(node)
        
    # Create relationships
    relationships = [
        ThreatRelationship("APT29", "CobaltStrike", "USES", {"confidence": 0.95}),
        ThreatRelationship("APT28", "Emotet", "USES", {"confidence": 0.90}),
        ThreatRelationship("Lazarus", "WannaCry", "USES", {"confidence": 0.98}),
        
        ThreatRelationship("CobaltStrike", "CVE-2023-12345", "EXPLOITS", {"confidence": 0.85}),
        ThreatRelationship("Emotet", "CVE-2023-67890", "EXPLOITS", {"confidence": 0.80}),
        
        ThreatRelationship("APT29", "C2-Server-Alpha", "CONTROLS", {"confidence": 0.92}),
        ThreatRelationship("APT28", "Phishing-Domain-1", "CONTROLS", {"confidence": 0.88}),
        
        ThreatRelationship("CobaltStrike", "C2-Server-Alpha", "COMMUNICATES_WITH", {"confidence": 0.95}),
        ThreatRelationship("Emotet", "Phishing-Domain-1", "COMMUNICATES_WITH", {"confidence": 0.85}),
    ]
    
    for rel in relationships:
        connector.create_relationship(rel)


if __name__ == "__main__":
    print("=" * 80)
    print("Neo4j Connector - Threat Intelligence Graph Database")
    print("=" * 80)
    print()
    
    # Initialize connector
    print("Connecting to Neo4j...")
    connector = Neo4jConnector()
    print(f"   Connected (mode: {'Neo4j' if not connector.simulation_mode else 'Simulation'})")
    print()
    
    # Clear existing data
    print("Clearing existing data...")
    connector.clear_database()
    print("   Database cleared")
    print()
    
    # Create demo graph
    print("Creating demo threat intelligence graph...")
    create_demo_graph(connector)
    print("   Demo graph created")
    print()
    
    # Get statistics
    print("Graph Statistics:")
    stats = connector.get_threat_statistics()
    print(f"   Total nodes: {stats.get('total_nodes', 0)}")
    print(f"   Total relationships: {stats.get('total_relationships', 0)}")
    print("   Node types:")
    for node_type, count in stats.get('node_types', {}).items():
        print(f"     • {node_type}: {count}")
    print("   Relationship types:")
    for rel_type, count in stats.get('relationship_types', {}).items():
        print(f"     • {rel_type}: {count}")
    print()
    
    # Query related nodes
    print("Finding threats related to APT29...")
    related = connector.find_related_nodes("APT29")
    print(f"   Found {len(related)} related entities:")
    for node in related[:5]:
        print(f"   • {node.node_id} ({node.node_type})")
    print()
    
    # Find attack paths
    print("Finding attack paths from APT29 to C2-Server-Alpha...")
    paths = connector.find_attack_paths("APT29", "C2-Server-Alpha")
    print(f"   Found {len(paths)} paths:")
    for i, path in enumerate(paths[:3], 1):
        print(f"   {i}. {' -> '.join(path)}")
    print()
    
    # Close connection
    connector.close()
    
    print("Neo4j connector demonstration complete!")
    print("=" * 80)


# Additional methods for backend API integration
def seed_demo_graph_api():
    """Seed demo graph for API use (called by populate_databases.py)."""
    connector = Neo4jConnector()
    connector.clear_database()
    create_demo_graph(connector)
    connector.close()
    return True


def query_threats_api(page: int = 1, limit: int = 10) -> tuple:
    """Query threats with pagination for API."""
    connector = Neo4jConnector()
    
    # Get all actor and malware nodes (threats)
    threats = []
    threat_nodes = [n for n in connector.nodes.values() 
                   if n.node_type in ['actor', 'malware', 'campaign']]
    
    total = len(threat_nodes)
    start = (page - 1) * limit
    end = start + limit
    
    for node in threat_nodes[start:end]:
        threats.append({
            "id": node.node_id,
            "title": node.properties.get('name', node.node_id),
            "severity": node.properties.get('severity', 'medium'),
            "timestamp": node.properties.get('discovered', None),
            "summary": node.properties.get('description', 'Threat entity'),
            "description": f"Threat type: {node.node_type}",
            "source": "Neo4j Graph Database",
            "indicators": [node.node_id],
            "affectedSystems": [],
            "recommendation": "Monitor and investigate"
        })
    
    connector.close()
    return threats, total


def get_threat_by_id_api(threat_id: str) -> Optional[Dict]:
    """Get single threat by ID for API."""
    connector = Neo4jConnector()
    
    node = connector.nodes.get(threat_id)
    if not node:
        connector.close()
        return None
    
    threat = {
        "id": node.node_id,
        "title": node.properties.get('name', node.node_id),
        "severity": node.properties.get('severity', 'medium'),
        "timestamp": node.properties.get('discovered', None),
        "summary": node.properties.get('description', 'Threat entity'),
        "description": f"Threat type: {node.node_type}. {node.properties.get('description', '')}",
        "source": "Neo4j Graph Database",
        "indicators": [node.node_id],
        "affectedSystems": [],
        "recommendation": "Investigate and mitigate"
    }
    
    connector.close()
    return threat


def search_threats_api(query: str) -> List[Dict]:
    """Search threats by keyword for API."""
    connector = Neo4jConnector()
    
    results = []
    for node in connector.nodes.values():
        node_str = json.dumps(node.properties).lower()
        if query.lower() in node_str or query.lower() in node.node_id.lower():
            results.append({
                "id": node.node_id,
                "title": node.properties.get('name', node.node_id),
                "severity": node.properties.get('severity', 'low'),
                "type": node.node_type
            })
    
    connector.close()
    return results
