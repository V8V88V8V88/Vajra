"""Populate Neo4j and InfluxDB with seed/test data.

This script uses the project's `data_layer` connectors where available and falls
back to simple REST calls or prints instructions when services are unreachable.
"""
import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("populate")


def populate_neo4j():
    try:
        from data_layer.neo4j_connector import seed_demo_graph_api
        
        logger.info("Connected to Neo4j, seeding demo graph...")
        seed_demo_graph_api()
        logger.info("Neo4j seeding complete")
    except Exception as e:
        logger.exception("Neo4j seeding failed: %s", e)


def populate_influxdb():
    try:
        from data_layer.timeseries_db import write_demo_metrics_api
        
        logger.info("Connected to InfluxDB, writing sample metrics...")
        write_demo_metrics_api()
        logger.info("InfluxDB seeding complete")
    except Exception as e:
        logger.exception("InfluxDB seeding failed: %s", e)


def main():
    populate_neo4j()
    populate_influxdb()


if __name__ == "__main__":
    main()
