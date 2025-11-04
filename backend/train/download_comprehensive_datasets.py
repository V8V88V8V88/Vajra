#!/usr/bin/env python3
"""
Comprehensive Cybersecurity Dataset Downloader
Downloads multiple datasets from various public sources for ML training
"""

import json
import os
import requests
import time
from datetime import datetime, timedelta
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base directory for storing datasets
BASE_DIR = Path(__file__).parent / "comprehensive_data"
BASE_DIR.mkdir(exist_ok=True)

class DatasetDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        })
        
    def download_mitre_attack(self):
        """Download MITRE ATT&CK framework data"""
        logger.info("Downloading MITRE ATT&CK data...")
        
        urls = {
            'enterprise': 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
            'mobile': 'https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json',
            'ics': 'https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json',
            'pre-attack': 'https://raw.githubusercontent.com/mitre/cti/master/pre-attack/pre-attack.json'
        }
        
        mitre_dir = BASE_DIR / "mitre_attack"
        mitre_dir.mkdir(exist_ok=True)
        
        results = {}
        for name, url in urls.items():
            try:
                response = self.session.get(url, timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    filepath = mitre_dir / f"{name}_attack.json"
                    with open(filepath, 'w') as f:
                        json.dump(data, f, indent=2)
                    
                    # Count objects
                    objects = data.get('objects', [])
                    results[name] = len(objects)
                    logger.info(f"  ✓ {name}: {len(objects)} objects")
                else:
                    logger.warning(f"  ✗ {name}: HTTP {response.status_code}")
                    results[name] = 0
                    
                time.sleep(1)  # Rate limiting
            except Exception as e:
                logger.error(f"  ✗ {name}: {str(e)}")
                results[name] = 0
                
        return results
    
    def download_cisa_kev(self):
        """Download CISA Known Exploited Vulnerabilities"""
        logger.info("Downloading CISA KEV catalog...")
        
        url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
        
        try:
            response = self.session.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                filepath = BASE_DIR / "cisa_kev.json"
                with open(filepath, 'w') as f:
                    json.dump(data, f, indent=2)
                
                count = len(data.get('vulnerabilities', []))
                logger.info(f"  ✓ Downloaded {count} known exploited vulnerabilities")
                return count
            else:
                logger.warning(f"  ✗ HTTP {response.status_code}")
                return 0
        except Exception as e:
            logger.error(f"  ✗ Error: {str(e)}")
            return 0
    
    def download_exploit_db_recent(self):
        """Download recent exploits from Exploit-DB"""
        logger.info("Downloading Exploit-DB recent exploits...")
        
        # Exploit-DB provides CSV files
        url = "https://gitlab.com/exploit-database/exploitdb/-/raw/main/files_exploits.csv"
        
        try:
            response = self.session.get(url, timeout=30)
            if response.status_code == 200:
                filepath = BASE_DIR / "exploitdb_exploits.csv"
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                # Count lines (exploits)
                lines = response.text.strip().split('\n')
                count = len(lines) - 1  # Subtract header
                logger.info(f"  ✓ Downloaded {count} exploit records")
                return count
            else:
                logger.warning(f"  ✗ HTTP {response.status_code}")
                return 0
        except Exception as e:
            logger.error(f"  ✗ Error: {str(e)}")
            return 0
    
    def download_threat_intel_feeds(self):
        """Download threat intelligence feeds"""
        logger.info("Downloading threat intelligence feeds...")
        
        feeds = {
            'alienvault_reputation': 'https://reputation.alienvault.com/reputation.generic',
            'abuse_ch_urlhaus': 'https://urlhaus.abuse.ch/downloads/json_recent/',
            'abuse_ch_threatfox': 'https://threatfox.abuse.ch/export/json/recent/',
        }
        
        intel_dir = BASE_DIR / "threat_intel"
        intel_dir.mkdir(exist_ok=True)
        
        results = {}
        for name, url in feeds.items():
            try:
                response = self.session.get(url, timeout=30)
                if response.status_code == 200:
                    # Determine file extension
                    ext = 'json' if 'json' in url else 'txt'
                    filepath = intel_dir / f"{name}.{ext}"
                    
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    
                    # Count entries
                    if ext == 'json':
                        try:
                            data = response.json()
                            if isinstance(data, list):
                                count = len(data)
                            elif isinstance(data, dict):
                                count = len(data.get('data', []))
                            else:
                                count = 1
                        except:
                            count = 1
                    else:
                        count = len(response.text.strip().split('\n'))
                    
                    results[name] = count
                    logger.info(f"  ✓ {name}: {count} entries")
                else:
                    logger.warning(f"  ✗ {name}: HTTP {response.status_code}")
                    results[name] = 0
                    
                time.sleep(2)  # Rate limiting
            except Exception as e:
                logger.error(f"  ✗ {name}: {str(e)}")
                results[name] = 0
                
        return results
    
    def download_malware_samples_metadata(self):
        """Download malware sample metadata"""
        logger.info("Downloading malware metadata...")
        
        # MalwareBazaar recent samples
        url = "https://mb-api.abuse.ch/api/v1/"
        
        try:
            # Get recent samples
            payload = {'query': 'get_recent'}
            response = self.session.post(url, data=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                filepath = BASE_DIR / "malware_samples.json"
                with open(filepath, 'w') as f:
                    json.dump(data, f, indent=2)
                
                count = len(data.get('data', []))
                logger.info(f"  ✓ Downloaded {count} malware sample records")
                return count
            else:
                logger.warning(f"  ✗ HTTP {response.status_code}")
                return 0
        except Exception as e:
            logger.error(f"  ✗ Error: {str(e)}")
            return 0
    
    def download_apt_groups(self):
        """Download APT group information"""
        logger.info("Downloading APT group data...")
        
        # MITRE groups are part of ATT&CK, but we'll also get additional sources
        url = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
        
        try:
            response = self.session.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                
                # Filter for intrusion-sets (APT groups)
                groups = [obj for obj in data.get('objects', []) 
                         if obj.get('type') == 'intrusion-set']
                
                filepath = BASE_DIR / "apt_groups.json"
                with open(filepath, 'w') as f:
                    json.dump(groups, f, indent=2)
                
                logger.info(f"  ✓ Downloaded {len(groups)} APT group profiles")
                return len(groups)
            else:
                logger.warning(f"  ✗ HTTP {response.status_code}")
                return 0
        except Exception as e:
            logger.error(f"  ✗ Error: {str(e)}")
            return 0
    
    def download_cve_data(self):
        """Download recent CVE data"""
        logger.info("Downloading CVE data (last 3 years)...")
        
        cve_dir = BASE_DIR / "cve_data"
        cve_dir.mkdir(exist_ok=True)
        
        # Download CVE feeds for last 3 years
        current_year = datetime.now().year
        years = [current_year - i for i in range(3)]
        
        total_cves = 0
        for year in years:
            url = f"https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-{year}.json.gz"
            
            try:
                logger.info(f"  Downloading CVEs for {year}...")
                response = self.session.get(url, timeout=60)
                
                if response.status_code == 200:
                    import gzip
                    
                    # Save compressed file first
                    gz_filepath = cve_dir / f"nvdcve-1.1-{year}.json.gz"
                    with open(gz_filepath, 'wb') as f:
                        f.write(response.content)
                    
                    # Decompress and count
                    json_filepath = cve_dir / f"nvdcve-1.1-{year}.json"
                    with gzip.open(gz_filepath, 'rb') as f_in:
                        with open(json_filepath, 'wb') as f_out:
                            f_out.write(f_in.read())
                    
                    # Count CVEs
                    with open(json_filepath, 'r') as f:
                        data = json.load(f)
                        count = len(data.get('CVE_Items', []))
                        total_cves += count
                        logger.info(f"    ✓ {year}: {count} CVEs")
                    
                    # Remove compressed file to save space
                    gz_filepath.unlink()
                else:
                    logger.warning(f"    ✗ {year}: HTTP {response.status_code}")
                    
                time.sleep(6)  # NVD rate limiting (6 seconds between requests)
            except Exception as e:
                logger.error(f"    ✗ {year}: {str(e)}")
        
        return total_cves
    
    def download_ioc_feeds(self):
        """Download Indicators of Compromise feeds"""
        logger.info("Downloading IOC feeds...")
        
        feeds = {
            'blocklist_de_ssh': 'https://lists.blocklist.de/lists/ssh.txt',
            'blocklist_de_bruteforce': 'https://lists.blocklist.de/lists/bruteforcelogin.txt',
            'phishtank': 'http://data.phishtank.com/data/online-valid.json',
        }
        
        ioc_dir = BASE_DIR / "ioc_feeds"
        ioc_dir.mkdir(exist_ok=True)
        
        results = {}
        for name, url in feeds.items():
            try:
                response = self.session.get(url, timeout=30)
                if response.status_code == 200:
                    ext = 'json' if 'json' in url else 'txt'
                    filepath = ioc_dir / f"{name}.{ext}"
                    
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    
                    # Count entries
                    if ext == 'json':
                        try:
                            data = response.json()
                            count = len(data) if isinstance(data, list) else 1
                        except:
                            count = 1
                    else:
                        count = len(response.text.strip().split('\n'))
                    
                    results[name] = count
                    logger.info(f"  ✓ {name}: {count} IOCs")
                else:
                    logger.warning(f"  ✗ {name}: HTTP {response.status_code}")
                    results[name] = 0
                    
                time.sleep(1)
            except Exception as e:
                logger.error(f"  ✗ {name}: {str(e)}")
                results[name] = 0
                
        return results
    
    def generate_time_series_data(self):
        """Generate synthetic time-series data for temporal model"""
        logger.info("Generating time-series threat data...")
        
        # Generate 5 years of daily threat metrics
        num_days = 365 * 5
        start_date = datetime.now() - timedelta(days=num_days)
        
        import numpy as np
        
        # Simulate threat levels with trends and seasonality
        time_series_data = []
        base_threat = 50
        
        for i in range(num_days):
            current_date = start_date + timedelta(days=i)
            
            # Add trend (increasing threats over time)
            trend = i * 0.02
            
            # Add seasonality (weekly pattern)
            seasonality = 10 * np.sin(2 * np.pi * i / 7)
            
            # Add random noise
            noise = np.random.normal(0, 5)
            
            # Add occasional spikes (cyber incidents)
            spike = 50 if np.random.random() < 0.05 else 0
            
            threat_level = max(0, base_threat + trend + seasonality + noise + spike)
            
            time_series_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'threat_level': round(threat_level, 2),
                'incidents': int(max(0, np.random.poisson(threat_level / 10))),
                'anomaly': 1 if spike > 0 else 0
            })
        
        filepath = BASE_DIR / "time_series_threats.json"
        with open(filepath, 'w') as f:
            json.dump(time_series_data, f, indent=2)
        
        logger.info(f"  ✓ Generated {num_days} days of time-series data")
        return num_days
    
    def download_all(self):
        """Download all datasets"""
        logger.info("\n" + "="*80)
        logger.info("COMPREHENSIVE DATASET DOWNLOAD")
        logger.info("="*80 + "\n")
        
        summary = {}
        
        # MITRE ATT&CK
        summary['mitre_attack'] = self.download_mitre_attack()
        
        # CISA KEV
        summary['cisa_kev'] = self.download_cisa_kev()
        
        # Exploit-DB
        summary['exploitdb'] = self.download_exploit_db_recent()
        
        # Threat Intel Feeds
        summary['threat_intel'] = self.download_threat_intel_feeds()
        
        # Malware Samples
        summary['malware'] = self.download_malware_samples_metadata()
        
        # APT Groups
        summary['apt_groups'] = self.download_apt_groups()
        
        # CVE Data (this takes longest)
        summary['cve_data'] = self.download_cve_data()
        
        # IOC Feeds
        summary['ioc_feeds'] = self.download_ioc_feeds()
        
        # Time Series
        summary['time_series'] = self.generate_time_series_data()
        
        # Save summary
        summary_file = BASE_DIR / "download_summary.json"
        with open(summary_file, 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'summary': summary
            }, f, indent=2)
        
        logger.info("\n" + "="*80)
        logger.info("DOWNLOAD SUMMARY")
        logger.info("="*80)
        
        total_objects = 0
        for category, data in summary.items():
            if isinstance(data, dict):
                count = sum(data.values())
                logger.info(f"{category}: {count} total objects")
                total_objects += count
            else:
                logger.info(f"{category}: {data} objects")
                total_objects += data
        
        logger.info(f"\nTOTAL OBJECTS DOWNLOADED: {total_objects:,}")
        logger.info(f"Data saved to: {BASE_DIR}")
        logger.info("="*80 + "\n")
        
        return summary

if __name__ == "__main__":
    downloader = DatasetDownloader()
    downloader.download_all()
