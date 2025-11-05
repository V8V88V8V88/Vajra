"""Crawler orchestrator for collecting threat intelligence from public sources."""

from __future__ import annotations

import datetime as dt
import logging
import os
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional

import requests


logger = logging.getLogger(__name__)


DEFAULT_USER_AGENT = "CyberThreatCrawler/1.0 (https://vajra.local)"
DEFAULT_TIMEOUT = 20


@dataclass
class CrawlerRecord:
    """Normalised representation of a crawled item."""

    id: str
    source: str
    title: str
    url: str
    summary: str
    published: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    metadata: Dict[str, str] = field(default_factory=dict)
ALLOWED_NVD_STATUSES = {"Analyzed", "Modified"}



@dataclass
class CrawlerLog:
    """Log message returned to the frontend."""

    timestamp: str
    message: str
    type: str = "info"  # info | success | error | warning


def _log(message: str, level: str = "info") -> CrawlerLog:
    now = dt.datetime.utcnow().isoformat() + "Z"
    if level == "error":
        logger.error(message)
    elif level == "warning":
        logger.warning(message)
    else:
        logger.info(message)
    return CrawlerLog(timestamp=now, message=message, type=level)


def _fetch_json(
    url: str,
    *,
    user_agent: str,
    timeout: int = DEFAULT_TIMEOUT,
    params: Optional[Dict[str, str]] = None,
    api_key: Optional[str] = None,
) -> dict:
    headers = {"User-Agent": user_agent}
    if api_key:
        headers["apiKey"] = api_key
    response = requests.get(url, headers=headers, params=params, timeout=timeout)
    response.raise_for_status()
    return response.json()


def crawl_nvd_recent(limit: int = 20, *, user_agent: str) -> Iterable[CrawlerRecord]:
    """Fetch recent CVEs from the NVD API."""

    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    now = dt.datetime.now(dt.timezone.utc)
    # Expand to 30 days to get more variety and catch more CVEs
    start = now - dt.timedelta(days=30)
    params = {
        "resultsPerPage": str(limit * 3),  # Fetch more to account for filtering
        "startIndex": "0",
        "pubStartDate": start.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "pubEndDate": now.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "orderBy": "publishedDate",  # Sort by newest first
        "sortOrder": "DESC",  # Descending order
    }
    api_key = os.environ.get("NVD_API_KEY")
    payload = _fetch_json(base_url, user_agent=user_agent, params=params, api_key=api_key)
    # Get all vulnerabilities, we'll filter and limit after checking status
    all_vulnerabilities = payload.get("vulnerabilities", [])
    
    # Filter to only "Analyzed" or "Modified" status, then limit
    filtered = []
    for item in all_vulnerabilities:
        cve = item.get("cve", {})
        status = cve.get("vulnStatus")
        if status in ALLOWED_NVD_STATUSES:
            filtered.append(item)
        if len(filtered) >= limit:
            break
    
    vulnerabilities = filtered

    for item in vulnerabilities:
        cve = item.get("cve", {})
        cve_id = cve.get("id")
        if not cve_id:
            continue

        descriptions = cve.get("descriptions", [])
        metrics = cve.get("metrics", {})
        status = cve.get("vulnStatus")

        if status and status not in ALLOWED_NVD_STATUSES:
            logger.debug("Skipping CVE %s with status %s", cve_id, status)
            continue

        severity = None
        score = None

        for key in ("cvssMetricV40", "cvssMetricV31", "cvssMetricV30", "cvssMetricV3", "cvssMetricV2"):
            metric_list = metrics.get(key)
            if metric_list:
                metric = metric_list[0]
                data = metric.get("cvssData", {})
                severity = metric.get("baseSeverity") or data.get("baseSeverity") or severity
                score = data.get("baseScore") or score
                break

        record = CrawlerRecord(
            id=cve_id,
            source="nvd",
            title=cve_id,
            url=f"https://www.cve.org/CVERecord?id={cve_id}",
            summary=descriptions[0].get("value", "") if descriptions else "",
            published=cve.get("published"),
            severity=severity,
            status=status,
            metadata={"cvss_score": str(score) if score is not None else ""},
        )
        yield record


def crawl_cisa_kev(limit: int = 20, *, user_agent: str) -> Iterable[CrawlerRecord]:
    """Fetch known exploited vulnerabilities from CISA."""

    url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    payload = _fetch_json(url, user_agent=user_agent)
    all_vulns = payload.get("vulnerabilities", [])
    
    # Sort by dateAdded (most recent first) to get newest additions
    sorted_vulns = sorted(
        all_vulns,
        key=lambda x: x.get("dateAdded", ""),
        reverse=True
    )
    vulns = sorted_vulns[:limit]

    for item in vulns:
        cve_id = item.get("cveID", item.get("vulnerabilityName", ""))
        # Use cve.org URL if we have a CVE ID, otherwise fall back to notes
        if cve_id and cve_id.startswith("CVE-"):
            cve_url = f"https://www.cve.org/CVERecord?id={cve_id}"
        else:
            cve_url = item.get("notes", "")
        
        record = CrawlerRecord(
            id=cve_id,
            source="cisa_kev",
            title=item.get("vulnerabilityName", cve_id or "Known Exploited Vulnerability"),
            url=cve_url,
            summary=item.get("shortDescription", ""),
            published=item.get("dateAdded"),
            severity=item.get("knownRansomwareCampaignUse"),
            metadata={
                "vendor": item.get("vendorProject", ""),
                "product": item.get("product", ""),
                "required_action": item.get("requiredAction", ""),
            },
        )
        yield record


def crawl_reddit_netsec(limit: int = 10, *, user_agent: str) -> Iterable[CrawlerRecord]:
    """Fetch recent posts from r/netsec."""

    # Fetch more to get variety
    url = f"https://www.reddit.com/r/netsec/new.json?limit={limit * 2}"
    payload = _fetch_json(url, user_agent=user_agent)
    all_posts = payload.get("data", {}).get("children", [])
    # Limit to requested amount
    posts = all_posts[:limit]

    for post in posts:
        data = post.get("data", {})
        record = CrawlerRecord(
            id=str(data.get("id")),
            source="reddit_netsec",
            title=data.get("title", ""),
            url=f"https://www.reddit.com{data.get('permalink', '')}",
            summary=data.get("selftext", "")[:300],
            published=dt.datetime.fromtimestamp(data.get("created_utc", 0)).isoformat() + "Z",
            metadata={
                "author": data.get("author", ""),
                "score": str(data.get("score", "")),
            },
        )
        yield record


def run_crawler() -> Dict[str, object]:
    """Main entrypoint invoked by the FastAPI endpoint."""

    user_agent = os.environ.get("CRAWLER_USER_AGENT", DEFAULT_USER_AGENT)

    logs: List[CrawlerLog] = []
    records: List[CrawlerRecord] = []

    sources = [
        ("NVD Recent CVEs", crawl_nvd_recent, {"limit": 20}),
        ("CISA Known Exploited", crawl_cisa_kev, {"limit": 20}),
        ("Reddit /r/netsec", crawl_reddit_netsec, {"limit": 10}),
    ]

    logs.append(_log("Starting crawler run (NVD, CISA KEV, Reddit)", "info"))

    for label, handler, kwargs in sources:
        logs.append(_log(f"Fetching data from {label}", "info"))
        try:
            fetched = list(handler(user_agent=user_agent, **kwargs))
            records.extend(fetched)
            logs.append(_log(f"Collected {len(fetched)} items from {label}", "success"))
        except requests.HTTPError as exc:
            logs.append(_log(f"HTTP error while fetching {label}: {exc}", "error"))
        except requests.RequestException as exc:
            logs.append(_log(f"Network error while fetching {label}: {exc}", "error"))
        except Exception as exc:  # pylint: disable=broad-except
            logs.append(_log(f"Unexpected error while fetching {label}: {exc}", "error"))

    unique_records: Dict[str, CrawlerRecord] = {}
    for record in records:
        unique_records.setdefault(f"{record.source}:{record.id}", record)

    logs.append(
        _log(
            f"Crawler finished. Sources: {len(sources)}, total items: {len(records)}, unique: {len(unique_records)}",
            "info",
        )
    )

    serialised_records = [record.__dict__ for record in unique_records.values()]

    return {
        "logs": [log.__dict__ for log in logs],
        "records": serialised_records,
        "stats": {
            "sources": len(sources),
            "items_total": len(records),
            "items_unique": len(unique_records),
        },
    }


__all__ = ["run_crawler", "crawl_nvd_recent", "crawl_cisa_kev", "crawl_reddit_netsec"]


