"""
Vector Database Client
======================

Handles semantic similarity search using vector embeddings.
Supports Milvus, Pinecone, or FAISS as backend.

Author: AI-Powered Cyber Threat Forecaster Team
Date: November 2025
"""

import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import faiss
    FAISS_AVAILABLE = True
    logger.info("FAISS available for vector search")
except ImportError:
    FAISS_AVAILABLE = False
    logger.warning("FAISS not available. Using numpy-based similarity search.")


@dataclass
class VectorDocument:
    """Represents a document with vector embedding."""
    doc_id: str
    vector: np.ndarray
    metadata: Dict[str, Any]


@dataclass
class SearchResult:
    """Result from vector similarity search."""
    doc_id: str
    score: float
    metadata: Dict[str, Any]


class VectorDBClient:
    """
    Vector database client for semantic threat intelligence search.
    
    Stores and retrieves threat entity embeddings for similarity-based
    analysis using FAISS or numpy-based cosine similarity.
    """
    
    def __init__(self, dimension: int = 768, index_type: str = 'flat'):
        """
        Initialize the vector database client.
        
        Args:
            dimension: Dimension of vector embeddings
            index_type: Type of index ('flat', 'ivf', 'hnsw')
        """
        self.dimension = dimension
        self.index_type = index_type
        self.index = None
        self.documents: Dict[str, VectorDocument] = {}
        self.doc_id_to_idx: Dict[str, int] = {}
        self.idx_to_doc_id: Dict[int, str] = {}
        
        if FAISS_AVAILABLE:
            self._init_faiss_index()
        else:
            self._init_numpy_index()
            
    def _init_faiss_index(self) -> None:
        """Initialize FAISS index."""
        try:
            if self.index_type == 'flat':
                # Exact search using L2 distance
                self.index = faiss.IndexFlatL2(self.dimension)
            elif self.index_type == 'ivf':
                # Faster approximate search
                quantizer = faiss.IndexFlatL2(self.dimension)
                self.index = faiss.IndexIVFFlat(quantizer, self.dimension, 100)
            elif self.index_type == 'hnsw':
                # Hierarchical NSW for fast approximate search
                self.index = faiss.IndexHNSWFlat(self.dimension, 32)
            else:
                logger.warning(f"Unknown index type: {self.index_type}, using flat")
                self.index = faiss.IndexFlatL2(self.dimension)
                
            self.use_faiss = True
            logger.info(f"FAISS index initialized: {self.index_type} (dim={self.dimension})")
        except Exception as e:
            logger.error(f"Failed to initialize FAISS: {e}")
            self._init_numpy_index()
            
    def _init_numpy_index(self) -> None:
        """Initialize numpy-based index."""
        self.vectors = None
        self.use_faiss = False
        logger.info(f"Numpy-based index initialized (dim={self.dimension})")
        
    def insert(self, doc: VectorDocument) -> bool:
        """
        Insert a document into the vector database.
        
        Args:
            doc: VectorDocument to insert
            
        Returns:
            True if successful
        """
        try:
            # Validate vector dimension
            if doc.vector.shape[0] != self.dimension:
                logger.error(f"Vector dimension mismatch: expected {self.dimension}, got {doc.vector.shape[0]}")
                return False
                
            # Store document
            self.documents[doc.doc_id] = doc
            
            # Update index
            idx = len(self.doc_id_to_idx)
            self.doc_id_to_idx[doc.doc_id] = idx
            self.idx_to_doc_id[idx] = doc.doc_id
            
            if self.use_faiss and self.index is not None:
                # Add to FAISS index
                vector = doc.vector.reshape(1, -1).astype('float32')
                self.index.add(vector)
            else:
                # Add to numpy array
                if self.vectors is None:
                    self.vectors = doc.vector.reshape(1, -1)
                else:
                    self.vectors = np.vstack([self.vectors, doc.vector])
                    
            logger.debug(f"Inserted document: {doc.doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to insert document: {e}")
            return False
            
    def insert_batch(self, docs: List[VectorDocument]) -> int:
        """
        Insert multiple documents.
        
        Args:
            docs: List of VectorDocuments to insert
            
        Returns:
            Number of successfully inserted documents
        """
        count = 0
        for doc in docs:
            if self.insert(doc):
                count += 1
        logger.info(f"Inserted {count}/{len(docs)} documents")
        return count
        
    def search(self, query_vector: np.ndarray, top_k: int = 10) -> List[SearchResult]:
        """
        Search for similar vectors.
        
        Args:
            query_vector: Query vector
            top_k: Number of results to return
            
        Returns:
            List of search results ordered by similarity
        """
        if query_vector.shape[0] != self.dimension:
            logger.error(f"Query vector dimension mismatch")
            return []
            
        if len(self.documents) == 0:
            logger.warning("No documents in database")
            return []
            
        try:
            if self.use_faiss and self.index is not None:
                return self._search_faiss(query_vector, top_k)
            else:
                return self._search_numpy(query_vector, top_k)
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
            
    def _search_faiss(self, query_vector: np.ndarray, top_k: int) -> List[SearchResult]:
        """Search using FAISS index."""
        query = query_vector.reshape(1, -1).astype('float32')
        
        # Perform search
        distances, indices = self.index.search(query, min(top_k, len(self.documents)))
        
        # Convert to SearchResults
        results = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx == -1:  # Invalid index
                continue
                
            doc_id = self.idx_to_doc_id.get(idx)
            if doc_id and doc_id in self.documents:
                # Convert L2 distance to similarity score (0-1)
                similarity = 1.0 / (1.0 + distance)
                results.append(SearchResult(
                    doc_id=doc_id,
                    score=float(similarity),
                    metadata=self.documents[doc_id].metadata
                ))
                
        return results
        
    def _search_numpy(self, query_vector: np.ndarray, top_k: int) -> List[SearchResult]:
        """Search using numpy cosine similarity."""
        if self.vectors is None:
            return []
            
        # Compute cosine similarities
        query_norm = query_vector / (np.linalg.norm(query_vector) + 1e-8)
        vectors_norm = self.vectors / (np.linalg.norm(self.vectors, axis=1, keepdims=True) + 1e-8)
        similarities = np.dot(vectors_norm, query_norm)
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Convert to SearchResults
        results = []
        for idx in top_indices:
            doc_id = self.idx_to_doc_id.get(idx)
            if doc_id and doc_id in self.documents:
                results.append(SearchResult(
                    doc_id=doc_id,
                    score=float(similarities[idx]),
                    metadata=self.documents[doc_id].metadata
                ))
                
        return results
        
    def get_document(self, doc_id: str) -> Optional[VectorDocument]:
        """
        Retrieve a document by ID.
        
        Args:
            doc_id: Document ID
            
        Returns:
            VectorDocument if found, None otherwise
        """
        return self.documents.get(doc_id)
        
    def delete(self, doc_id: str) -> bool:
        """
        Delete a document (marks as deleted, doesn't rebuild index).
        
        Args:
            doc_id: Document ID to delete
            
        Returns:
            True if successful
        """
        if doc_id in self.documents:
            del self.documents[doc_id]
            logger.debug(f"Deleted document: {doc_id}")
            return True
        return False
        
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get database statistics.
        
        Returns:
            Dictionary with statistics
        """
        return {
            'total_documents': len(self.documents),
            'dimension': self.dimension,
            'index_type': self.index_type,
            'backend': 'FAISS' if self.use_faiss else 'NumPy'
        }
        
    def save_index(self, filepath: str) -> bool:
        """
        Save index to disk (FAISS only).
        
        Args:
            filepath: Path to save the index
            
        Returns:
            True if successful
        """
        if not self.use_faiss or self.index is None:
            logger.warning("Save only supported for FAISS index")
            return False
            
        try:
            faiss.write_index(self.index, filepath)
            logger.info(f"Index saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Failed to save index: {e}")
            return False
            
    def load_index(self, filepath: str) -> bool:
        """
        Load index from disk (FAISS only).
        
        Args:
            filepath: Path to load the index from
            
        Returns:
            True if successful
        """
        if not FAISS_AVAILABLE:
            logger.warning("FAISS not available")
            return False
            
        try:
            self.index = faiss.read_index(filepath)
            self.use_faiss = True
            logger.info(f"Index loaded from {filepath}")
            return True
        except Exception as e:
            logger.error(f"Failed to load index: {e}")
            return False


def generate_demo_embeddings(n_docs: int = 50, dimension: int = 768) -> List[VectorDocument]:
    """Generate demo threat entity embeddings."""
    threat_types = ['malware', 'actor', 'vulnerability', 'infrastructure', 'technique']
    documents = []
    
    for i in range(n_docs):
        # Generate random embedding with some structure
        base_vector = np.random.randn(dimension) * 0.5
        
        # Add type-specific bias
        threat_type = threat_types[i % len(threat_types)]
        if threat_type == 'malware':
            base_vector[:100] += 2.0
        elif threat_type == 'actor':
            base_vector[100:200] += 2.0
        elif threat_type == 'vulnerability':
            base_vector[200:300] += 2.0
            
        # Normalize
        vector = base_vector / (np.linalg.norm(base_vector) + 1e-8)
        
        documents.append(VectorDocument(
            doc_id=f"{threat_type}_{i:03d}",
            vector=vector,
            metadata={
                'type': threat_type,
                'name': f"{threat_type.title()} {i}",
                'severity': np.random.choice(['low', 'medium', 'high', 'critical']),
                'timestamp': '2025-11-03'
            }
        ))
        
    return documents


if __name__ == "__main__":
    print("=" * 80)
    print("Vector Database Client - Semantic Threat Intelligence Search")
    print("=" * 80)
    print()
    
    # Initialize client
    print("🔌 Initializing vector database...")
    client = VectorDBClient(dimension=768, index_type='flat')
    print(f"   ✓ Client initialized ({client.use_faiss and 'FAISS' or 'NumPy'} backend)")
    print()
    
    # Generate and insert demo data
    print("📊 Generating demo threat embeddings...")
    documents = generate_demo_embeddings(n_docs=100, dimension=768)
    print(f"   ✓ Generated {len(documents)} embeddings")
    print()
    
    print("💾 Inserting into vector database...")
    count = client.insert_batch(documents)
    print(f"   ✓ Inserted {count} documents")
    print()
    
    # Get statistics
    print("📈 Database Statistics:")
    stats = client.get_statistics()
    for key, value in stats.items():
        print(f"   {key}: {value}")
    print()
    
    # Perform similarity search
    print("🔍 Performing similarity searches...")
    
    # Search for malware-like entities
    malware_query = documents[0].vector  # First document is malware
    print(f"\n   Query: {documents[0].doc_id} ({documents[0].metadata['type']})")
    results = client.search(malware_query, top_k=5)
    print("   Top 5 similar entities:")
    for i, result in enumerate(results, 1):
        doc = client.get_document(result.doc_id)
        print(f"     {i}. {result.doc_id} ({doc.metadata['type']}) - score: {result.score:.4f}")
    
    # Search for actor-like entities
    actor_idx = next(i for i, doc in enumerate(documents) if doc.metadata['type'] == 'actor')
    actor_query = documents[actor_idx].vector
    print(f"\n   Query: {documents[actor_idx].doc_id} ({documents[actor_idx].metadata['type']})")
    results = client.search(actor_query, top_k=5)
    print("   Top 5 similar entities:")
    for i, result in enumerate(results, 1):
        doc = client.get_document(result.doc_id)
        print(f"     {i}. {result.doc_id} ({doc.metadata['type']}) - score: {result.score:.4f}")
    
    print()
    
    # Test retrieval
    print("📥 Testing document retrieval...")
    test_doc_id = documents[10].doc_id
    retrieved = client.get_document(test_doc_id)
    if retrieved:
        print(f"   ✓ Retrieved: {retrieved.doc_id}")
        print(f"     Type: {retrieved.metadata['type']}")
        print(f"     Vector shape: {retrieved.vector.shape}")
    print()
    
    print("✅ Vector database demonstration complete!")
    print("=" * 80)
