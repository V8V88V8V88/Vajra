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
    id: str = field(default_factory=lambda: f"log-{dt.datetime.utcnow().timestamp()}-{id(dt.datetime.utcnow())}")


def _log(message: str, level: str = "info") -> CrawlerLog:
    now = dt.datetime.utcnow().isoformat() + "Z"
    log_id = f"log-{dt.datetime.utcnow().timestamp()}-{id(now)}"
    if level == "error":
        logger.error(message)
    elif level == "warning":
        logger.warning(message)
    else:
        logger.info(message)
    return CrawlerLog(timestamp=now, message=message, type=level, id=log_id)


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


def crawl_nvd_recent(limit: int = 20, *, user_agent: str, start_date: str = None, end_date: str = None) -> Iterable[CrawlerRecord]:
    """Fetch recent CVEs from the NVD API.
    
    Args:
        limit: Maximum number of CVEs to fetch
        user_agent: User agent string for requests
        start_date: Start date in YYYY-MM-DD format (optional)
        end_date: End date in YYYY-MM-DD format (optional)
    """

    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    now = dt.datetime.now(dt.timezone.utc)
    
    # Use provided dates or default to 5 years (to get historical CVEs)
    if start_date and end_date:
        try:
            start = dt.datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
            end = dt.datetime.strptime(end_date, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
            # Set end date to end of day
            end = end.replace(hour=23, minute=59, second=59)
        except ValueError:
            # Fallback to default if parsing fails
            start = now - dt.timedelta(days=1825)  # 5 years
            end = now
    else:
        # Default to 5 years to get historical CVEs, not just recent ones
        start = now - dt.timedelta(days=1825)  # 5 years back
        end = now
    
    api_key = os.environ.get("NVD_API_KEY")
    
    # Fetch with pagination to get all results
    all_vulnerabilities = []
    start_index = 0
    results_per_page = 2000  # NVD API max per page
    # Remove max_pages limit - fetch ALL pages until we get all results
    pages_fetched = 0
    total_results = None  # Will be set from first API response
    
    # Calculate expected range - increase limit for longer date ranges
    days_diff = (end - start).days
    if days_diff > 1095:  # 3+ years
        target_limit = limit * 10  # Fetch many more for very long ranges
    elif days_diff > 730:  # 2+ years
        target_limit = limit * 8
    elif days_diff > 365:  # 1+ year
        target_limit = limit * 5
    elif days_diff > 180:  # 6+ months
        target_limit = limit * 3
    else:
        target_limit = limit * 2
    
    # Fetch ALL pages until we get all results or hit the target limit
    while True:
        params = {
            "resultsPerPage": str(results_per_page),
            "startIndex": str(start_index),
            "pubStartDate": start.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "pubEndDate": end.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "orderBy": "publishedDate",
            "sortOrder": "DESC",
        }
        
        try:
            payload = _fetch_json(base_url, user_agent=user_agent, params=params, api_key=api_key)
            vulnerabilities_batch = payload.get("vulnerabilities", [])
            
            # Set total_results from first response
            if total_results is None:
                total_results = payload.get("totalResults", 0)
                date_range_str = f"{start_date} to {end_date}" if start_date and end_date else f"{start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}"
                logger.info(f"NVD API reports {total_results} total CVEs in date range {date_range_str}")
                
                # Warn if no results but we're querying a valid date range
                if total_results == 0 and days_diff > 0:
                    logger.warning(f"NVD API returned 0 results for date range {date_range_str}. This might indicate:")
                    logger.warning("  - API rate limiting (try adding NVD_API_KEY)")
                    logger.warning("  - Date range too old (NVD may have limited historical data)")
                    logger.warning("  - Network/API issues")
            
            if not vulnerabilities_batch:
                logger.info(f"No more CVEs to fetch (page {pages_fetched + 1})")
                break
            
            all_vulnerabilities.extend(vulnerabilities_batch)
            pages_fetched += 1
            
            # Log progress every 5 pages
            if pages_fetched % 5 == 0:
                filtered_count = sum(1 for item in all_vulnerabilities 
                                   if item.get("cve", {}).get("vulnStatus") in ALLOWED_NVD_STATUSES)
                logger.info(f"Fetched {pages_fetched} pages, {len(all_vulnerabilities)} total CVEs, {filtered_count} analyzed")
            
            # Check if we've fetched all available results
            if total_results > 0:
                if start_index + len(vulnerabilities_batch) >= total_results:
                    logger.info(f"Fetched all {total_results} CVEs from NVD API")
                    break
                # Also check if we got fewer results than expected (last page)
                if len(vulnerabilities_batch) < results_per_page:
                    logger.info(f"Reached last page (got {len(vulnerabilities_batch)} CVEs, expected up to {results_per_page})")
                    break
            
            # Check if we have enough filtered results (but continue fetching if there are more pages)
            filtered_count = sum(1 for item in all_vulnerabilities 
                               if item.get("cve", {}).get("vulnStatus") in ALLOWED_NVD_STATUSES)
            # Only stop early if we have enough AND we're past a reasonable number of pages
            # This ensures we fetch historical data even if limit is reached early
            if filtered_count >= target_limit and pages_fetched >= 5:
                logger.info(f"Reached target limit of {target_limit} analyzed CVEs after {pages_fetched} pages")
                break
            
            start_index += results_per_page
            
            # Rate limiting - small delay between requests to avoid hitting API limits
            import time
            time.sleep(0.6)  # NVD API recommends 0.6s between requests
        except Exception as e:
            logger.warning(f"Error fetching NVD page {pages_fetched + 1}: {e}")
            # Don't break immediately - try to continue if it's a transient error
            if pages_fetched == 0:
                # If first page fails, break
                break
            # Otherwise, log and continue (might be rate limit)
            import time
            time.sleep(2)  # Longer delay on error
            start_index += results_per_page
    
    # Filter to only "Analyzed" or "Modified" status, then limit
    filtered = []
    for item in all_vulnerabilities:
        cve = item.get("cve", {})
        status = cve.get("vulnStatus")
        if status in ALLOWED_NVD_STATUSES:
            filtered.append(item)
        if len(filtered) >= target_limit:
            break
    
    vulnerabilities = filtered
    logger.info(f"Fetched {len(all_vulnerabilities)} total CVEs, filtered to {len(vulnerabilities)} analyzed CVEs")
    
    # If we got very few results, log a warning
    if len(vulnerabilities) == 0 and len(all_vulnerabilities) > 0:
        status_counts = {}
        for item in all_vulnerabilities[:100]:  # Sample first 100
            status = item.get("cve", {}).get("vulnStatus", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        logger.warning(f"No analyzed CVEs found. Status distribution: {status_counts}")
    elif len(vulnerabilities) == 0:
        logger.warning(f"No CVEs fetched from NVD API. Check API key and date range.")

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

        # If severity is missing but we have a CVSS score, determine severity from score
        if not severity and score is not None:
            try:
                score_float = float(score)
                if score_float >= 9.0:
                    severity = "CRITICAL"
                elif score_float >= 7.0:
                    severity = "HIGH"
                elif score_float >= 4.0:
                    severity = "MEDIUM"
                else:
                    severity = "LOW"
            except (ValueError, TypeError):
                pass

        # Normalize severity to lowercase for consistency
        if severity:
            severity = severity.lower()

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


def crawl_cisa_kev(limit: int = 20, *, user_agent: str, start_date: str = None, end_date: str = None) -> Iterable[CrawlerRecord]:
    """Fetch known exploited vulnerabilities from CISA.
    
    Args:
        limit: Maximum number of vulnerabilities to fetch
        user_agent: User agent string for requests
        start_date: Start date in YYYY-MM-DD format (optional, filters by dateAdded)
        end_date: End date in YYYY-MM-DD format (optional, filters by dateAdded)
    """

    url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    payload = _fetch_json(url, user_agent=user_agent)
    all_vulns = payload.get("vulnerabilities", [])
    
    # Filter by date range if provided
    if start_date or end_date:
        filtered_vulns = []
        for vuln in all_vulns:
            date_added = vuln.get("dateAdded", "")
            if not date_added:
                continue
            
            try:
                vuln_date = dt.datetime.strptime(date_added[:10], "%Y-%m-%d").date()
                
                if start_date:
                    start = dt.datetime.strptime(start_date, "%Y-%m-%d").date()
                    if vuln_date < start:
                        continue
                
                if end_date:
                    end = dt.datetime.strptime(end_date, "%Y-%m-%d").date()
                    if vuln_date > end:
                        continue
                
                filtered_vulns.append(vuln)
            except ValueError:
                # Skip if date parsing fails
                continue
        
        all_vulns = filtered_vulns
    
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
            severity="critical",  # CISA KEV entries are all critical by definition (known exploited)
            metadata={
                "vendor": item.get("vendorProject", ""),
                "product": item.get("product", ""),
                "required_action": item.get("requiredAction", ""),
                "cvss_score": "9.0",  # Mark as critical since it's in KEV
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
        # Determine severity based on keywords in title/content
        title_lower = data.get("title", "").lower()
        content_lower = data.get("selftext", "").lower()
        combined = f"{title_lower} {content_lower}"
        
        severity = "medium"  # Default for Reddit posts
        if any(word in combined for word in ["critical", "0-day", "zero-day", "rce", "remote code execution"]):
            severity = "high"
        elif any(word in combined for word in ["exploit", "poc", "proof of concept", "cve-"]):
            severity = "high"
        
        record = CrawlerRecord(
            id=str(data.get("id")),
            source="reddit_netsec",
            title=data.get("title", ""),
            url=f"https://www.reddit.com{data.get('permalink', '')}",
            summary=data.get("selftext", "")[:300],
            published=dt.datetime.fromtimestamp(data.get("created_utc", 0)).isoformat() + "Z",
            severity=severity,
            metadata={
                "author": data.get("author", ""),
                "score": str(data.get("score", "")),
            },
        )
        yield record


def crawl_github_advisories(limit: int = 20, *, user_agent: str, start_date: str = None, end_date: str = None) -> Iterable[CrawlerRecord]:
    """Fetch recent security advisories from GitHub."""
    
    try:
        api_url = "https://api.github.com/repos/github/advisory-database/commits"
        params = {"per_page": min(limit, 30), "path": "advisories/github-reviewed"}
        
        payload = _fetch_json(api_url, user_agent=user_agent, params=params)
        
        count = 0
        for commit in payload:
            if count >= limit:
                break
                
            commit_data = commit.get("commit", {})
            message = commit_data.get("message", "")
            date = commit_data.get("author", {}).get("date", "")
            
            # Filter by date if provided
            if start_date or end_date:
                try:
                    commit_dt = dt.datetime.fromisoformat(date.replace('Z', '+00:00'))
                    if start_date:
                        start_dt = dt.datetime.strptime(start_date, "%Y-%m-%d")
                        if commit_dt.date() < start_dt.date():
                            continue
                    if end_date:
                        end_dt = dt.datetime.strptime(end_date, "%Y-%m-%d")
                        if commit_dt.date() > end_dt.date():
                            continue
                except (ValueError, AttributeError):
                    pass
            
            # Extract CVE/GHSA ID
            cve_id = None
            if "CVE-" in message:
                import re
                match = re.search(r'CVE-\d{4}-\d+', message)
                if match:
                    cve_id = match.group(0)
            
            if cve_id or "GHSA-" in message or "advisory" in message.lower():
                # GitHub advisories are typically high severity
                severity = "high"
                message_lower = message.lower()
                if any(word in message_lower for word in ["critical", "critical severity", "cvss:3.1/av:n"]):
                    severity = "critical"
                elif any(word in message_lower for word in ["low", "low severity"]):
                    severity = "low"
                
                record = CrawlerRecord(
                    id=commit.get("sha", "")[:12],
                    source="github_advisories",
                    title=message.split("\n")[0][:100] or "GitHub Security Advisory",
                    url=f"https://github.com/github/advisory-database/commit/{commit.get('sha', '')}",
                    summary=message[:300],
                    published=date,
                    severity=severity,
                    metadata={"commit_sha": commit.get("sha", ""), "cve_id": cve_id or ""},
                )
                yield record
                count += 1
    except Exception as e:
        logger.warning(f"GitHub advisories fetch failed: {e}")
        return


def crawl_abuse_ch_urlhaus(limit: int = 20, *, user_agent: str) -> Iterable[CrawlerRecord]:
    """Fetch recent malware URLs from Abuse.ch URLhaus."""
    
    url = "https://urlhaus.abuse.ch/downloads/json_recent/"
    
    try:
        payload = _fetch_json(url, user_agent=user_agent, timeout=30)
        
        # URLhaus returns a list directly, not wrapped in a dict
        urls = payload if isinstance(payload, list) else payload.get("urls", [])
        
        if not urls:
            logger.warning(f"URLhaus returned empty data. Payload type: {type(payload)}, keys: {list(payload.keys()) if isinstance(payload, dict) else 'N/A'}")
            return
        
        count = 0
        for item in urls:
            if count >= limit:
                break
            
            # Handle both dict and list item formats
            if isinstance(item, dict):
                url_entry = item.get("url", "")
                threat = item.get("threat", "malware")
                date_added = item.get("date_added", "")
                
                record = CrawlerRecord(
                    id=f"urlhaus-{item.get('id', item.get('urlhash', str(hash(url_entry))))}",
                    source="abuse_ch_urlhaus",
                    title=f"Malware URL: {threat}",
                    url=url_entry or "https://urlhaus.abuse.ch/",
                    summary=f"Threat type: {threat}. Status: {item.get('url_status', 'unknown')}",
                    published=date_added,
                    severity="high" if threat in ["malware", "phishing"] else "medium",
                    metadata={
                        "threat_type": threat,
                        "url_status": item.get("url_status", ""),
                        "host": item.get("host", ""),
                    },
                )
                yield record
                count += 1
        
        if count == 0:
            logger.warning(f"URLhaus: No valid records found in {len(urls)} items")
    except requests.HTTPError as e:
        logger.error(f"URLhaus HTTP error: {e.response.status_code} - {e.response.text[:200]}")
        return
    except Exception as e:
        logger.error(f"URLhaus fetch failed: {e}", exc_info=True)
        return


def crawl_abuse_ch_threatfox(limit: int = 20, *, user_agent: str) -> Iterable[CrawlerRecord]:
    """Fetch recent IOCs from Abuse.ch ThreatFox."""
    
    url = "https://threatfox.abuse.ch/export/json/recent/"
    
    try:
        payload = _fetch_json(url, user_agent=user_agent, timeout=30)
        
        # ThreatFox returns {"query_status": "...", "data": [...]}
        if isinstance(payload, dict):
            query_status = payload.get("query_status", "")
            if query_status != "ok":
                logger.warning(f"ThreatFox query status: {query_status}")
            iocs = payload.get("data", [])
        elif isinstance(payload, list):
            iocs = payload
        else:
            logger.warning(f"ThreatFox returned unexpected format: {type(payload)}")
            return
        
        if not iocs:
            logger.warning(f"ThreatFox returned empty data")
            return
        
        count = 0
        for item in iocs:
            if count >= limit:
                break
            
            if isinstance(item, dict):
                ioc_value = item.get("ioc", "")
                threat_type = item.get("threat_type", "")
                malware = item.get("malware", "")
                first_seen = item.get("first_seen", "")
                
                record = CrawlerRecord(
                    id=f"threatfox-{item.get('id', ioc_value[:16] if ioc_value else str(count))}",
                    source="abuse_ch_threatfox",
                    title=f"IOC: {malware} ({threat_type})",
                    url=f"https://threatfox.abuse.ch/ioc/{item.get('id', '')}" if item.get("id") else "https://threatfox.abuse.ch/",
                    summary=f"IOC Type: {threat_type}, Malware: {malware}",
                    published=first_seen,
                    severity="high",
                    metadata={
                        "ioc": ioc_value,
                        "threat_type": threat_type,
                        "malware": malware,
                        "ioc_type": item.get("ioc_type", ""),
                    },
                )
                yield record
                count += 1
        
        if count == 0:
            logger.warning(f"ThreatFox: No valid records found in {len(iocs)} items")
    except requests.HTTPError as e:
        logger.error(f"ThreatFox HTTP error: {e.response.status_code} - {e.response.text[:200]}")
        return
    except Exception as e:
        logger.error(f"ThreatFox fetch failed: {e}", exc_info=True)
        return


def crawl_exploit_db(limit: int = 15, *, user_agent: str, start_date: str = None, end_date: str = None) -> Iterable[CrawlerRecord]:
    """Fetch recent exploits from Exploit-DB."""
    
    try:
        import feedparser
    except ImportError:
        logger.error("feedparser not installed. Install with: pip install feedparser")
        return
    
    try:
        feed_url = "https://www.exploit-db.com/rss.xml"
        feed = feedparser.parse(feed_url)
        
        if feed.bozo and feed.bozo_exception:
            logger.warning(f"Exploit-DB RSS parse error: {feed.bozo_exception}")
        
        if not feed.entries:
            logger.warning(f"Exploit-DB returned no entries")
            return
        
        count = 0
        skipped_by_date = 0
        for entry in feed.entries:
            if count >= limit:
                break
            
            # Filter by date if provided
            if start_date or end_date:
                entry_date = entry.get("published_parsed")
                if entry_date:
                    try:
                        entry_dt = dt.datetime(*entry_date[:6])
                        if start_date:
                            start_dt = dt.datetime.strptime(start_date, "%Y-%m-%d")
                            if entry_dt.date() < start_dt.date():
                                skipped_by_date += 1
                                continue
                        if end_date:
                            end_dt = dt.datetime.strptime(end_date, "%Y-%m-%d")
                            if entry_dt.date() > end_dt.date():
                                skipped_by_date += 1
                                continue
                    except (ValueError, TypeError) as e:
                        logger.debug(f"Date parsing error for Exploit-DB entry: {e}")
                        pass
                else:
                    # If no date filter, include it
                    pass
            
            record = CrawlerRecord(
                id=entry.get("id", "").split("/")[-1] or str(count),
                source="exploit_db",
                title=entry.get("title", ""),
                url=entry.get("link", ""),
                summary=entry.get("summary", "")[:300] if entry.get("summary") else "",
                published=entry.get("published", ""),
                severity="high",
                metadata={
                    "author": entry.get("author", ""),
                    "platform": entry.get("tags", [{}])[0].get("term", "") if entry.get("tags") else "",
                },
            )
            yield record
            count += 1
        
        if count == 0:
            logger.warning(f"Exploit-DB: No records returned. Total entries: {len(feed.entries)}, skipped by date: {skipped_by_date}")
    except Exception as e:
        logger.error(f"Exploit-DB fetch failed: {e}", exc_info=True)
        return


def crawl_malwarebazaar(limit: int = 15, *, user_agent: str) -> Iterable[CrawlerRecord]:
    """Fetch recent malware samples from MalwareBazaar."""
    
    url = "https://mb-api.abuse.ch/api/v1/"
    
    try:
        headers = {"User-Agent": user_agent}
        data = {"query": "get_recent", "selector": "time"}
        
        response = requests.post(url, headers=headers, data=data, timeout=30)
        response.raise_for_status()
        payload = response.json()
        
        query_status = payload.get("query_status", "")
        if query_status != "ok":
            logger.warning(f"MalwareBazaar query status: {query_status}")
        
        samples = payload.get("data", [])
        
        if not samples:
            logger.warning(f"MalwareBazaar returned no samples")
            return
        
        count = 0
        for sample in samples:
            if count >= limit:
                break
            
            if isinstance(sample, dict):
                sha256 = sample.get("sha256_hash", "")
                malware_type = sample.get("malware_type", "")
                first_seen = sample.get("first_seen", "")
                
                record = CrawlerRecord(
                    id=sha256[:16] if sha256 else sample.get("id", str(hash(str(sample)))),
                    source="malwarebazaar",
                    title=f"Malware Sample: {malware_type}",
                    url=f"https://bazaar.abuse.ch/sample/{sha256}/" if sha256 else "https://bazaar.abuse.ch/",
                    summary=f"Malware Type: {malware_type}, SHA256: {sha256[:32]}..." if sha256 else f"Type: {malware_type}",
                    published=first_seen,
                    severity="high",
                    metadata={
                        "sha256": sha256,
                        "malware_type": malware_type,
                        "file_type": sample.get("file_type", ""),
                        "signature": sample.get("signature", ""),
                    },
                )
                yield record
                count += 1
        
        if count == 0:
            logger.warning(f"MalwareBazaar: No valid records found in {len(samples)} samples")
    except requests.HTTPError as e:
        logger.error(f"MalwareBazaar HTTP error: {e.response.status_code} - {e.response.text[:200]}")
        return
    except Exception as e:
        logger.error(f"MalwareBazaar fetch failed: {e}", exc_info=True)
        return


def run_crawler(start_date: str = None, end_date: str = None) -> Dict[str, object]:
    """Main entrypoint invoked by the FastAPI endpoint.
    
    Args:
        start_date: Start date in YYYY-MM-DD format (optional)
        end_date: End date in YYYY-MM-DD format (optional)
    """

    user_agent = os.environ.get("CRAWLER_USER_AGENT", DEFAULT_USER_AGENT)

    logs: List[CrawlerLog] = []
    records: List[CrawlerRecord] = []
    
    # Calculate date range and adjust limits
    if start_date and end_date:
        try:
            start_dt = dt.datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = dt.datetime.strptime(end_date, "%Y-%m-%d")
            days_diff = (end_dt - start_dt).days
            
            logs.append(_log(f"Crawling data from {start_date} to {end_date} ({days_diff} days)", "info"))
            date_range_msg = f" ({start_date} to {end_date})"
            
            # Increase limits for longer date ranges - much higher to get historical data
            if days_diff > 1095:  # 3+ years
                nvd_limit = 10000  # Fetch many CVEs for historical ranges
                cisa_limit = 1000
            elif days_diff > 730:  # 2+ years
                nvd_limit = 5000
                cisa_limit = 500
            elif days_diff > 365:  # 1+ year
                nvd_limit = 2000
                cisa_limit = 500
            elif days_diff > 180:  # 6+ months
                nvd_limit = 1000
                cisa_limit = 300
            elif days_diff > 90:  # 3+ months
                nvd_limit = 500
                cisa_limit = 200
            else:
                nvd_limit = 200  # Default (increased from 50)
                cisa_limit = 100
        except ValueError:
            # If date parsing fails, use default 5 year range
            nvd_limit = 10000
            cisa_limit = 1000
            date_range_msg = " (default: 5 years, date parsing failed)"
    else:
        # Default to fetching many CVEs (5 year range)
        nvd_limit = 10000
        cisa_limit = 1000
        date_range_msg = " (default: 5 years)"

    sources = [
        ("NVD Recent CVEs", crawl_nvd_recent, {"limit": nvd_limit, "start_date": start_date, "end_date": end_date}),
        ("CISA Known Exploited", crawl_cisa_kev, {"limit": cisa_limit, "start_date": start_date, "end_date": end_date}),
        ("Reddit /r/netsec", crawl_reddit_netsec, {"limit": 15}),
        ("GitHub Security Advisories", crawl_github_advisories, {"limit": 15, "start_date": start_date, "end_date": end_date}),
        ("Abuse.ch URLhaus", crawl_abuse_ch_urlhaus, {"limit": 20}),
        ("Abuse.ch ThreatFox", crawl_abuse_ch_threatfox, {"limit": 15}),
        ("Exploit-DB", crawl_exploit_db, {"limit": 15, "start_date": start_date, "end_date": end_date}),
        ("MalwareBazaar", crawl_malwarebazaar, {"limit": 15}),
    ]

    logs.append(_log(f"Starting crawler run (8 sources: NVD, CISA KEV, Reddit, GitHub, Abuse.ch, Exploit-DB, MalwareBazaar){date_range_msg}", "info"))

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

    # Calculate final stats
    total_items = len(records)
    unique_items = len(unique_records)
    successful_sources = sum(1 for log in logs if log.type == "success" and "Collected" in log.message)
    
    # Add completion log with summary
    logs.append(
        _log(
            f"Crawler finished successfully. Sources crawled: {successful_sources}/{len(sources)}, total items: {total_items}, unique: {unique_items}",
            "success",
        )
    )
    
    # Add final summary log
    logs.append(
        _log(
            f"Crawler run completed at {dt.datetime.utcnow().isoformat()}Z. Total execution time: {len(logs)} log entries processed.",
            "info",
        )
    )

    serialised_records = [record.__dict__ for record in unique_records.values()]

    return {
        "logs": [log.__dict__ for log in logs],
        "records": serialised_records,
        "stats": {
            "sources": successful_sources,  # Count successful sources, not total attempted
            "items_total": total_items,
            "items_unique": unique_items,
        },
    }


__all__ = [
    "run_crawler", 
    "crawl_nvd_recent", 
    "crawl_cisa_kev", 
    "crawl_reddit_netsec",
    "crawl_github_advisories",
    "crawl_abuse_ch_urlhaus",
    "crawl_abuse_ch_threatfox",
    "crawl_exploit_db",
    "crawl_malwarebazaar",
]


