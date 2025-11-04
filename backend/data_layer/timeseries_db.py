"""
Time-Series Database Client
============================

Manages temporal threat data storage and retrieval using InfluxDB
or pandas-based fallback for time-series analytics.

Author: AI-Powered Cyber Threat Forecaster Team
Date: November 2025
"""

import logging
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    from influxdb_client import InfluxDBClient, Point, WritePrecision
    from influxdb_client.client.write_api import SYNCHRONOUS
    INFLUXDB_AVAILABLE = True
except ImportError:
    logger.warning("InfluxDB client not available. Using pandas-based storage.")
    INFLUXDB_AVAILABLE = False


@dataclass
class ThreatMetric:
    """Represents a time-series threat metric."""
    measurement: str
    timestamp: datetime
    fields: Dict[str, float]
    tags: Dict[str, str]


@dataclass
class QueryResult:
    """Result from time-series query."""
    measurement: str
    data: pd.DataFrame


class TimeSeriesDBClient:
    """
    Time-series database client for threat intelligence metrics.
    
    Stores and queries temporal data including risk scores, attack volumes,
    vulnerability counts, and other time-indexed threat metrics.
    """
    
    def __init__(self, 
                 url: str = "http://localhost:8086",
                 token: str = "my-token",
                 org: str = "my-org",
                 bucket: str = "threat-intel"):
        """
        Initialize the time-series database client.
        
        Args:
            url: InfluxDB server URL
            token: Authentication token
            org: Organization name
            bucket: Bucket name for data storage
        """
        self.url = url
        self.token = token
        self.org = org
        self.bucket = bucket
        self.client = None
        self.write_api = None
        self.query_api = None
        
        # Pandas-based storage for simulation mode
        self.dataframes: Dict[str, pd.DataFrame] = {}
        
        if INFLUXDB_AVAILABLE:
            try:
                self._connect()
            except Exception as e:
                logger.warning(f"Could not connect to InfluxDB: {e}. Using pandas mode.")
                self.simulation_mode = True
        else:
            logger.info("InfluxDB not available. Using pandas mode.")
            self.simulation_mode = True
            
    def _connect(self) -> None:
        """Establish connection to InfluxDB."""
        try:
            self.client = InfluxDBClient(url=self.url, token=self.token, org=self.org)
            self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
            self.query_api = self.client.query_api()
            
            # Test connection
            ready = self.client.ready()
            if ready:
                self.simulation_mode = False
                logger.info(f"Connected to InfluxDB at {self.url}")
            else:
                raise ConnectionError("InfluxDB not ready")
        except Exception as e:
            logger.error(f"InfluxDB connection failed: {e}")
            self.simulation_mode = True
            
    def close(self) -> None:
        """Close the InfluxDB connection."""
        if self.client:
            self.client.close()
            logger.info("InfluxDB connection closed")
            
    def write_metric(self, metric: ThreatMetric) -> bool:
        """
        Write a single metric to the database.
        
        Args:
            metric: ThreatMetric to write
            
        Returns:
            True if successful
        """
        if self.simulation_mode:
            return self._write_pandas(metric)
            
        try:
            # Create InfluxDB point
            point = Point(metric.measurement).time(metric.timestamp, WritePrecision.NS)
            
            # Add tags
            for key, value in metric.tags.items():
                point = point.tag(key, value)
                
            # Add fields
            for key, value in metric.fields.items():
                point = point.field(key, value)
                
            # Write to InfluxDB
            self.write_api.write(bucket=self.bucket, record=point)
            logger.debug(f"Wrote metric: {metric.measurement}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to write metric: {e}")
            return False
            
    def write_metrics(self, metrics: List[ThreatMetric]) -> int:
        """
        Write multiple metrics.
        
        Args:
            metrics: List of ThreatMetrics to write
            
        Returns:
            Number of successfully written metrics
        """
        count = 0
        for metric in metrics:
            if self.write_metric(metric):
                count += 1
        logger.info(f"Wrote {count}/{len(metrics)} metrics")
        return count
        
    def _write_pandas(self, metric: ThreatMetric) -> bool:
        """Write metric to pandas DataFrame."""
        try:
            # Create row
            row_data = {
                'timestamp': metric.timestamp,
                **metric.tags,
                **metric.fields
            }
            
            # Add to appropriate DataFrame
            if metric.measurement not in self.dataframes:
                self.dataframes[metric.measurement] = pd.DataFrame([row_data])
            else:
                self.dataframes[metric.measurement] = pd.concat([
                    self.dataframes[metric.measurement],
                    pd.DataFrame([row_data])
                ], ignore_index=True)
                
            logger.debug(f"Wrote metric (pandas): {metric.measurement}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to write metric (pandas): {e}")
            return False
            
    def query(self, 
             measurement: str,
             start: datetime,
             end: Optional[datetime] = None,
             filters: Optional[Dict[str, str]] = None,
             aggregation: Optional[str] = None,
             window: Optional[str] = None) -> Optional[QueryResult]:
        """
        Query time-series data.
        
        Args:
            measurement: Measurement name to query
            start: Start time
            end: End time (default: now)
            filters: Tag filters
            aggregation: Aggregation function ('mean', 'sum', 'max', 'min')
            window: Aggregation window (e.g., '1h', '1d')
            
        Returns:
            QueryResult with data or None if failed
        """
        if end is None:
            end = datetime.now()
            
        if self.simulation_mode:
            return self._query_pandas(measurement, start, end, filters, aggregation, window)
            
        try:
            # Build Flux query
            query = f'''
            from(bucket: "{self.bucket}")
                |> range(start: {start.isoformat()}Z, stop: {end.isoformat()}Z)
                |> filter(fn: (r) => r["_measurement"] == "{measurement}")
            '''
            
            # Add tag filters
            if filters:
                for key, value in filters.items():
                    query += f'\n    |> filter(fn: (r) => r["{key}"] == "{value}")'
                    
            # Add aggregation
            if aggregation and window:
                query += f'\n    |> aggregateWindow(every: {window}, fn: {aggregation})'
                
            # Execute query
            tables = self.query_api.query(query, org=self.org)
            
            # Convert to DataFrame
            records = []
            for table in tables:
                for record in table.records:
                    records.append({
                        'timestamp': record.get_time(),
                        'field': record.get_field(),
                        'value': record.get_value(),
                        **{k: v for k, v in record.values.items() if k not in ['_time', '_field', '_value']}
                    })
                    
            if records:
                df = pd.DataFrame(records)
                return QueryResult(measurement=measurement, data=df)
            else:
                return QueryResult(measurement=measurement, data=pd.DataFrame())
                
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return None
            
    def _query_pandas(self,
                     measurement: str,
                     start: datetime,
                     end: datetime,
                     filters: Optional[Dict[str, str]],
                     aggregation: Optional[str],
                     window: Optional[str]) -> Optional[QueryResult]:
        """Query data from pandas DataFrame."""
        if measurement not in self.dataframes:
            logger.warning(f"Measurement not found: {measurement}")
            return QueryResult(measurement=measurement, data=pd.DataFrame())
            
        try:
            df = self.dataframes[measurement].copy()
            
            # Ensure timestamp is datetime
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                
                # Filter by time range
                df = df[(df['timestamp'] >= start) & (df['timestamp'] <= end)]
                
            # Apply tag filters
            if filters:
                for key, value in filters.items():
                    if key in df.columns:
                        df = df[df[key] == value]
                        
            # Apply aggregation
            if aggregation and window and 'timestamp' in df.columns:
                df = df.set_index('timestamp')
                
                # Convert window string to pandas format
                window_map = {
                    '1m': '1min', '5m': '5min', '15m': '15min',
                    '1h': '1H', '1d': '1D', '1w': '1W'
                }
                pd_window = window_map.get(window, window)
                
                # Select numeric columns
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                
                if aggregation == 'mean':
                    df = df[numeric_cols].resample(pd_window).mean()
                elif aggregation == 'sum':
                    df = df[numeric_cols].resample(pd_window).sum()
                elif aggregation == 'max':
                    df = df[numeric_cols].resample(pd_window).max()
                elif aggregation == 'min':
                    df = df[numeric_cols].resample(pd_window).min()
                    
                df = df.reset_index()
                
            return QueryResult(measurement=measurement, data=df)
            
        except Exception as e:
            logger.error(f"Query failed (pandas): {e}")
            return None
            
    def get_latest_metrics(self, measurement: str, 
                          limit: int = 100) -> Optional[QueryResult]:
        """
        Get the most recent metrics.
        
        Args:
            measurement: Measurement name
            limit: Maximum number of records
            
        Returns:
            QueryResult with latest data
        """
        if self.simulation_mode:
            if measurement not in self.dataframes:
                return QueryResult(measurement=measurement, data=pd.DataFrame())
                
            df = self.dataframes[measurement].copy()
            if 'timestamp' in df.columns:
                df = df.sort_values('timestamp', ascending=False).head(limit)
            else:
                df = df.tail(limit)
                
            return QueryResult(measurement=measurement, data=df)
            
        # InfluxDB query for latest metrics
        end = datetime.now()
        start = end - timedelta(days=7)  # Last 7 days
        return self.query(measurement, start, end)
        
    def get_statistics(self, measurement: str, 
                      start: datetime,
                      end: Optional[datetime] = None) -> Dict[str, float]:
        """
        Get statistical summary of metrics.
        
        Args:
            measurement: Measurement name
            start: Start time
            end: End time
            
        Returns:
            Dictionary with statistics
        """
        result = self.query(measurement, start, end)
        
        if result is None or result.data.empty:
            return {}
            
        stats = {}
        numeric_cols = result.data.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if col != 'timestamp':
                stats[f'{col}_mean'] = float(result.data[col].mean())
                stats[f'{col}_max'] = float(result.data[col].max())
                stats[f'{col}_min'] = float(result.data[col].min())
                stats[f'{col}_std'] = float(result.data[col].std())
                
        return stats


def generate_demo_metrics(days: int = 30) -> List[ThreatMetric]:
    """Generate demo threat metrics."""
    metrics = []
    base_time = datetime.now() - timedelta(days=days)
    
    for day in range(days * 24):  # Hourly data
        timestamp = base_time + timedelta(hours=day)
        
        # Risk score metric
        risk_score = 0.5 + 0.3 * np.sin(day / 12) + np.random.normal(0, 0.1)
        risk_score = max(0.0, min(1.0, risk_score))
        
        metrics.append(ThreatMetric(
            measurement='risk_score',
            timestamp=timestamp,
            fields={'value': risk_score},
            tags={'source': 'threat_analyzer', 'severity': 'medium'}
        ))
        
        # Attack volume metric
        attack_volume = 100 + 50 * np.sin(day / 24) + np.random.normal(0, 20)
        attack_volume = max(0, attack_volume)
        
        metrics.append(ThreatMetric(
            measurement='attack_volume',
            timestamp=timestamp,
            fields={'count': attack_volume},
            tags={'type': 'network', 'status': 'detected'}
        ))
        
        # Vulnerability count
        vuln_count = 10 + np.random.poisson(3)
        
        metrics.append(ThreatMetric(
            measurement='vulnerability_count',
            timestamp=timestamp,
            fields={'count': float(vuln_count)},
            tags={'severity': 'high', 'status': 'unpatched'}
        ))
        
    return metrics


if __name__ == "__main__":
    print("=" * 80)
    print("Time-Series Database Client - Threat Metrics Storage")
    print("=" * 80)
    print()
    
    # Initialize client
    print("Connecting to time-series database...")
    client = TimeSeriesDBClient()
    print(f"   Connected (mode: {'InfluxDB' if not client.simulation_mode else 'Pandas'})")
    print()
    
    # Generate and write demo metrics
    print("Generating demo threat metrics (30 days)...")
    metrics = generate_demo_metrics(days=30)
    print(f"   Generated {len(metrics)} metrics")
    print()
    
    print("Writing metrics to database...")
    count = client.write_metrics(metrics)
    print(f"   Wrote {count} metrics")
    print()
    
    # Query recent data
    print("Querying recent risk scores...")
    start = datetime.now() - timedelta(days=7)
    result = client.query('risk_score', start)
    
    if result and not result.data.empty:
        print(f"   Retrieved {len(result.data)} records")
        print(f"   Latest risk score: {result.data['value'].iloc[-1]:.3f}")
        print()
        
    # Get statistics
    print("Computing statistics for last 30 days...")
    start = datetime.now() - timedelta(days=30)
    stats = client.get_statistics('risk_score', start)
    
    if stats:
        print("   Risk Score Statistics:")
        for key, value in stats.items():
            print(f"     {key}: {value:.3f}")
    print()
    
    # Query with aggregation
    print("Querying daily aggregated attack volumes...")
    result = client.query(
        'attack_volume',
        start=datetime.now() - timedelta(days=7),
        aggregation='mean',
        window='1d'
    )
    
    if result and not result.data.empty:
        print(f"   Retrieved {len(result.data)} daily aggregates")
        if 'count' in result.data.columns:
            print(f"   Average daily attacks: {result.data['count'].mean():.0f}")
    print()
    
    # Close connection
    client.close()
    
    print("Time-series database demonstration complete!")
    print("=" * 80)


# Additional methods for backend API integration
def write_demo_metrics_api():
    """Write demo metrics for API use (called by populate_databases.py)."""
    import random
    from datetime import datetime, timedelta
    
    client = TimeSeriesDBClient()
    
    # Generate synthetic metrics for last 30 days
    now = datetime.now()
    for days_ago in range(30, 0, -1):
        timestamp = now - timedelta(days=days_ago)
        
        # Write various metrics
        client.write('threat_count', random.randint(50, 200), timestamp, 
                    {'severity': 'all', 'source': 'osint'})
        client.write('risk_score', random.uniform(0.3, 0.9), timestamp,
                    {'category': 'overall'})
        client.write('attack_volume', random.randint(100, 500), timestamp,
                    {'type': 'network'})
        client.write('critical_threats', random.randint(5, 25), timestamp,
                    {'priority': 'critical'})
    
    client.close()
    return True


def get_overview_metrics_api() -> Dict:
    """Get overview metrics for API dashboard."""
    client = TimeSeriesDBClient()
    
    now = datetime.now()
    yesterday = now - timedelta(days=1)
    
    # Query latest metrics
    threat_data = client.query('threat_count', yesterday)
    critical_data = client.query('critical_threats', yesterday)
    
    total_threats = 2847  # default
    critical_threats = 12  # default
    
    if threat_data and not threat_data.data.empty:
        total_threats = int(threat_data.data['value'].sum())
    
    if critical_data and not critical_data.data.empty:
        critical_threats = int(critical_data.data['value'].iloc[-1])
    
    client.close()
    
    return {
        "totalThreats": total_threats,
        "criticalThreats": critical_threats,
        "activeCampaigns": 34,
        "lastUpdate": now.isoformat()
    }
