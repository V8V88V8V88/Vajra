#!/usr/bin/env python3
"""
Test script to verify backend-frontend integration
"""
import requests
import json
import sys

API_BASE = "http://localhost:8000"

def test_endpoint(name, url, method="GET", data=None):
    """Test a single endpoint"""
    # Longer timeout for AI inference endpoints
    timeout = 30 if "/analyze/" in url else 5
    
    try:
        print(f"\n{'='*60}")
        print(f"Testing: {name}")
        print(f"URL: {method} {url}")
        print(f"{'='*60}")
        
        if method == "GET":
            response = requests.get(url, timeout=timeout)
        else:
            response = requests.post(url, json=data, timeout=timeout)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)[:500]}...")
            print(f"✅ {name} - PASSED")
            return True
        else:
            print(f"❌ {name} - FAILED (Status: {response.status_code})")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ {name} - FAILED (Connection Error - Is backend running?)")
        return False
    except Exception as e:
        print(f"❌ {name} - FAILED (Error: {e})")
        return False

def main():
    print("\n" + "="*60)
    print("Backend-Frontend Integration Test")
    print("="*60)
    
    results = []
    
    # Test health check
    results.append(test_endpoint(
        "Health Check",
        f"{API_BASE}/health"
    ))
    
    # Test stats
    results.append(test_endpoint(
        "Get Stats",
        f"{API_BASE}/api/stats"
    ))
    
    # Test threats listing
    results.append(test_endpoint(
        "List Threats",
        f"{API_BASE}/api/threats?page=1&limit=5"
    ))
    
    # Test NLP analysis
    results.append(test_endpoint(
        "NLP Analysis",
        f"{API_BASE}/analyze/nlp",
        method="POST",
        data={"text": "APT28 launched a sophisticated ransomware campaign targeting financial institutions"}
    ))
    
    # Test temporal analysis
    results.append(test_endpoint(
        "Temporal Forecast",
        f"{API_BASE}/analyze/temporal",
        method="POST",
        data={"signal_type": "attack_volume", "horizon": 7}
    ))
    
    # Test anomaly detection
    results.append(test_endpoint(
        "Anomaly Detection",
        f"{API_BASE}/analyze/anomaly",
        method="POST",
        data={"features": [0.5, 0.3, 0.8]}
    ))
    
    # Test graph analysis
    results.append(test_endpoint(
        "Graph Analysis (GNN)",
        f"{API_BASE}/analyze/graph",
        method="POST",
        data={"nodes": [], "edges": []}
    ))
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n✅ All tests PASSED! Backend is fully integrated with frontend.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check backend logs.")
        sys.exit(1)

if __name__ == "__main__":
    main()
