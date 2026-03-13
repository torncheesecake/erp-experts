#!/usr/bin/env python3
"""Refresh marketing reports data from GA4 and the latest LinkedIn export."""

from __future__ import annotations

import json
import re
import shutil
import urllib.parse
from urllib.parse import urlparse
from datetime import date, datetime, timedelta
from pathlib import Path

import openpyxl
import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account


REPO_ROOT = Path(__file__).resolve().parent.parent
REPORTS_PATH = REPO_ROOT / "src" / "data" / "reports.json"
EXPORTS_DIR = REPO_ROOT / "src" / "exports"
DOWNLOADS_DIR = Path.home() / "Downloads"
SERVICE_ACCOUNT_PATH = DOWNLOADS_DIR / "just-shape-378410-0112e5fd4f2c.json"
GA4_PROPERTY_ID = "309916265"
SEARCH_CONSOLE_SITE = "https://www.erpexperts.co.uk/"

INTERNAL_PATH_PREFIXES = ("/reports", "/changelog", "/seo-roadmap", "/api")
TITLE_ALIASES = {
    "ERP Experts | UK's Trusted NetSuite Implementation Partner": "Homepage",
    "About Us | ERP Experts": "About Us",
    "Resources | ERP Experts": "Resources",
    "Contact Us | ERP Experts": "Contact",
    "Case Studies | ERP Experts": "Case Studies",
    "NetSuite Implementation | ERP Experts": "Implementation",
    "Support Plans | ERP Experts": "Support",
    "One Score to Rule Them All": "One Score to Rule Them All",
    "Partners | ERP Experts": "Partners",
    "What is an ERP System? A Beginner's Guide | ERP Experts": "What is an ERP System",
    "What is NetSuite? | Cloud ERP for UK Businesses | ERP Experts": "What is NetSuite?",
}
CTA_LABEL_ALIASES = {
    "navbar_lets_talk": "Navbar - Let's Talk",
    "navbar_mobile_lets_talk": "Navbar Mobile - Let's Talk",
    "hero_start_project": "Hero - Start a Project",
    "footer_cta_book_call": "Footer CTA - Book a Call",
    "footer_cta_start_project": "Footer CTA - Start a Project",
    "footer_start_conversation": "Footer - Start a Conversation",
    "contact_form_submit": "Contact - Form Submit",
    "contact_book_call": "Contact - Book a Call",
    "contact_netscore_cta": "Contact - NETscore CTA",
    "implementation_footer_book_call": "Implementation - Book a Call",
    "implementation_netscore_cta": "Implementation - NETscore CTA",
    "support_footer_book_call": "Support - Book a Call",
    "support_footer_get_support": "Support - Get Support",
    "support_netscore_cta": "Support - NETscore CTA",
    "journey_get_started": "Journey - Get Started",
    "journey_explore_support": "Journey - Explore Support",
    "about_footer_start_conversation": "About - Start a Conversation",
    "about_netscore_cta": "About - NETscore CTA",
    "resources_cta_contact": "Resources - Contact",
    "resources_cta_case_studies": "Resources - Case Studies",
    "resource_article_contact": "Resource Article - Contact",
    "faq_cta_contact": "FAQ - Contact",
    "faq_cta_book_call": "FAQ - Book a Call",
    "faq_netscore_cta": "FAQ - NETscore CTA",
    "project_delivery_hero_cta": "Project Delivery - Hero CTA",
    "project_delivery_hero_audit_cta": "Project Delivery - Hero Audit CTA",
    "project_delivery_footer_contact": "Project Delivery - Footer Contact",
    "project_delivery_footer_audit": "Project Delivery - Footer Audit",
    "project_delivery_netscore_cta": "Project Delivery - NETscore CTA",
    "project_delivery_guarantee_cta": "Project Delivery - Guarantee CTA",
    "implementation_hero_whats_netsuite": "Implementation - What is NetSuite?",
    "partners_cta_case_studies": "Partners - Case Studies",
}


def parse_date(value: str, fmt: str) -> date:
    return datetime.strptime(value, fmt).date()


class GA4Client:
    def __init__(self, service_account_path: Path, property_id: str) -> None:
        scopes = ["https://www.googleapis.com/auth/analytics.readonly"]
        self.credentials = service_account.Credentials.from_service_account_file(
            service_account_path, scopes=scopes
        )
        self.credentials.refresh(Request())
        self.base_url = (
            f"https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport"
        )

    def run_report(
        self,
        *,
        start_date: date,
        end_date: date,
        metrics: list[str],
        dimensions: list[str] | None = None,
        dimension_filter: dict | None = None,
        order_bys: list[dict] | None = None,
        limit: int | None = None,
    ) -> list[dict]:
        payload: dict = {
            "dateRanges": [
                {"startDate": start_date.isoformat(), "endDate": end_date.isoformat()}
            ],
            "metrics": [{"name": name} for name in metrics],
        }
        if dimensions:
            payload["dimensions"] = [{"name": name} for name in dimensions]
        if dimension_filter:
            payload["dimensionFilter"] = dimension_filter
        if order_bys:
            payload["orderBys"] = order_bys
        if limit:
            payload["limit"] = limit

        response = requests.post(
            self.base_url,
            headers={"Authorization": f"Bearer {self.credentials.token}"},
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        body = response.json()
        rows = []
        for row in body.get("rows", []):
            rows.append(
                {
                    "dimensions": [value["value"] for value in row.get("dimensionValues", [])],
                    "metrics": [value["value"] for value in row.get("metricValues", [])],
                }
            )
        return rows


class SearchConsoleClient:
    def __init__(self, service_account_path: Path) -> None:
        scopes = ["https://www.googleapis.com/auth/webmasters.readonly"]
        self.credentials = service_account.Credentials.from_service_account_file(
            service_account_path, scopes=scopes
        )
        self.credentials.refresh(Request())

    def query(
        self,
        *,
        site_url: str,
        start_date: date,
        end_date: date,
        dimensions: list[str] | None = None,
        row_limit: int = 10,
    ) -> dict:
        encoded_site = urllib.parse.quote(site_url, safe="")
        url = (
            f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/searchAnalytics/query"
        )
        payload: dict = {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "rowLimit": row_limit,
        }
        if dimensions:
            payload["dimensions"] = dimensions
        response = requests.post(
            url,
            headers={"Authorization": f"Bearer {self.credentials.token}"},
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        return response.json()


def latest_linkedin_weekly_export() -> Path:
    pattern = re.compile(
        r"^Content_(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})_RicWilson(?: \(\d+\))?\.xlsx$"
    )
    candidates = []
    for path in DOWNLOADS_DIR.iterdir():
        match = pattern.match(path.name)
        if match:
            end_date = parse_date(match.group(2), "%Y-%m-%d")
            candidates.append((end_date, path.stat().st_mtime, path))
    if not candidates:
        raise FileNotFoundError("No weekly LinkedIn workbook found in Downloads.")
    candidates.sort(reverse=True)
    return candidates[0][2]


def copy_export(source: Path) -> None:
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    target = EXPORTS_DIR / source.name
    if source.resolve() != target.resolve():
        shutil.copy2(source, target)


def to_int(value: str | float | int) -> int:
    return int(round(float(value)))


def to_float(value: str | float | int, digits: int = 1) -> float:
    return round(float(value), digits)


def normalise_path(path: str) -> str | None:
    if not path:
        return None
    path = path.strip()
    if any(path == prefix or path.startswith(f"{prefix}/") for prefix in INTERNAL_PATH_PREFIXES):
        return None
    return path


def normalise_page_title(title: str) -> str | None:
    if not title:
        return None
    if title in TITLE_ALIASES:
        return TITLE_ALIASES[title]
    if "Internal" in title or title.startswith("Changelog") or title.startswith("Page Not Found"):
        return None
    trimmed = title.replace(" | ERP Experts", "").strip()
    if trimmed.startswith("SEO Content Roadmap"):
        return None
    return trimmed


def humanise_cta_label(label: str) -> str:
    if label in CTA_LABEL_ALIASES:
        return CTA_LABEL_ALIASES[label]
    text = label.replace("_", " ").strip().title()
    text = re.sub(r"\bCta\b", "CTA", text)
    text = re.sub(r"\bNetscore\b", "NETscore", text)
    text = re.sub(r"\bFaq\b", "FAQ", text)
    text = re.sub(r"\bSeo\b", "SEO", text)
    text = re.sub(r"\bAi\b", "AI", text)
    return text


def aggregate_weekly_linkedin(workbook_path: Path) -> dict:
    workbook = openpyxl.load_workbook(workbook_path, data_only=True)
    engagement = workbook["ENGAGEMENT"]
    followers = workbook["FOLLOWERS"]

    week_end_match = re.search(r"_(\d{4}-\d{2}-\d{2})_RicWilson", workbook_path.name)
    if not week_end_match:
        raise ValueError(f"Could not parse week ending from {workbook_path.name}")
    week_ending = parse_date(week_end_match.group(1), "%Y-%m-%d")
    week_start = week_ending - timedelta(days=6)

    impressions = 0
    engagements = 0
    for row in engagement.iter_rows(min_row=2, values_only=True):
        date_str, day_impressions, day_engagements = row
        if not date_str:
            continue
        day = parse_date(date_str, "%m/%d/%Y")
        if week_start <= day <= week_ending:
            impressions += int(day_impressions or 0)
            engagements += int(day_engagements or 0)

    total_followers = int(followers["B1"].value or 0)
    new_followers = 0
    for row in followers.iter_rows(min_row=4, values_only=True):
        date_str, daily_new = row
        if not date_str:
            continue
        day = parse_date(date_str, "%m/%d/%Y")
        if week_start <= day <= week_ending:
            new_followers += int(daily_new or 0)

    engagement_rate = round((engagements / impressions) * 100, 1) if impressions else 0.0
    return {
        "weekEnding": week_ending.isoformat(),
        "linkedin": {
            "followers": total_followers,
            "impressions": impressions,
            "engagementRate": engagement_rate,
            "engagements": engagements,
            "newFollowers": new_followers,
        },
    }


def bucket_sources(rows: list[dict], total_sessions: int, percent: bool) -> dict:
    buckets = {"organic": 0, "direct": 0, "referral": 0, "social": 0, "unassigned": 0}
    for row in rows:
        channel = row["dimensions"][0]
        sessions = to_int(row["metrics"][0])
        if channel == "Direct":
            buckets["direct"] += sessions
        elif channel == "Organic Search":
            buckets["organic"] += sessions
        elif channel == "Referral":
            buckets["referral"] += sessions
        elif "Social" in channel:
            buckets["social"] += sessions
        else:
            buckets["unassigned"] += sessions

    if not percent:
        return {key: value for key, value in buckets.items() if value > 0}

    if total_sessions <= 0:
        return {key: 0 for key in buckets}
    return {
        key: round((value / total_sessions) * 100) if value > 0 else 0
        for key, value in buckets.items()
    }


def build_page_engagement(rows: list[dict]) -> list[dict]:
    pages = []
    seen = set()
    for row in rows:
        title = normalise_page_title(row["dimensions"][0])
        if not title or title in seen:
            continue
        seen.add(title)
        views = to_int(row["metrics"][0])
        sessions = to_int(row["metrics"][1])
        bounce_rate = round(float(row["metrics"][4]) * 100, 1)
        pages.append(
            {
                "page": title,
                "avgTimeOnPage": to_int(row["metrics"][3]),
                "views": views,
                "sessions": sessions,
                "activeUsers": to_int(row["metrics"][2]),
                "bounceRate": bounce_rate,
            }
        )
    return pages[:9]


def build_exit_pages(page_engagement: list[dict]) -> list[dict]:
    exit_pages = []
    for page in page_engagement:
        exits = round(page["sessions"] * (page["bounceRate"] / 100))
        exit_pages.append(
            {
                "page": page["page"],
                "exitRate": page["bounceRate"],
                "exits": exits,
            }
        )
    exit_pages.sort(key=lambda item: item["exitRate"], reverse=True)
    return exit_pages


def normalise_search_console_path(url: str) -> str | None:
    if not url:
        return None
    parsed = urlparse(url)
    path = parsed.path or "/"
    if parsed.query:
        path = f"{path}?{parsed.query}"
    return path


def refresh_search_console(
    client: SearchConsoleClient, *, start_date: date, end_date: date
) -> dict:
    totals = client.query(
        site_url=SEARCH_CONSOLE_SITE,
        start_date=start_date,
        end_date=end_date,
        row_limit=1,
    )
    top_pages = client.query(
        site_url=SEARCH_CONSOLE_SITE,
        start_date=start_date,
        end_date=end_date,
        dimensions=["page"],
        row_limit=10,
    )

    rows = top_pages.get("rows", [])
    pages = []
    for row in rows:
        page_url = row.get("keys", [""])[0]
        path = normalise_search_console_path(page_url)
        if not path:
            continue
        pages.append(
            {
                "path": path,
                "impressions": round(row.get("impressions", 0)),
                "clicks": round(row.get("clicks", 0)),
                "ctr": round(row.get("ctr", 0) * 100, 2),
                "avgPosition": round(row.get("position", 0), 2),
            }
        )

    return {
        "period": f"{start_date.isoformat()} to {end_date.isoformat()}",
        "totalImpressions": round(totals.get("rows", [{}])[0].get("impressions", 0)),
        "totalClicks": round(totals.get("rows", [{}])[0].get("clicks", 0)),
        "avgCTR": round(totals.get("rows", [{}])[0].get("ctr", 0) * 100, 2),
        "topLandingPages": pages[:5],
    }


def main() -> None:
    if not REPORTS_PATH.exists():
        raise FileNotFoundError(f"Missing reports file: {REPORTS_PATH}")
    if not SERVICE_ACCOUNT_PATH.exists():
        raise FileNotFoundError(f"Missing service account JSON: {SERVICE_ACCOUNT_PATH}")

    with REPORTS_PATH.open("r", encoding="utf-8") as handle:
        reports = json.load(handle)

    linkedin_export = latest_linkedin_weekly_export()
    copy_export(linkedin_export)
    linkedin_week = aggregate_weekly_linkedin(linkedin_export)
    week_label = linkedin_week["weekEnding"]

    latest_report_date = parse_date(week_label, "%Y-%m-%d")
    ga_week_end = latest_report_date - timedelta(days=1)
    ga_week_start = ga_week_end - timedelta(days=6)
    period_end = ga_week_end
    period_start = period_end - timedelta(days=27)

    ga_client = GA4Client(SERVICE_ACCOUNT_PATH, GA4_PROPERTY_ID)
    search_console_client = SearchConsoleClient(SERVICE_ACCOUNT_PATH)

    weekly_overall = ga_client.run_report(
        start_date=ga_week_start,
        end_date=ga_week_end,
        metrics=["sessions", "screenPageViews", "activeUsers", "newUsers", "averageSessionDuration"],
    )[0]
    weekly_events = ga_client.run_report(
        start_date=ga_week_start,
        end_date=ga_week_end,
        dimensions=["eventName"],
        metrics=["eventCount", "totalUsers"],
        order_bys=[{"metric": {"metricName": "eventCount"}, "desc": True}],
        limit=20,
    )
    weekly_sources = ga_client.run_report(
        start_date=ga_week_start,
        end_date=ga_week_end,
        dimensions=["sessionDefaultChannelGroup"],
        metrics=["sessions"],
        order_bys=[{"metric": {"metricName": "sessions"}, "desc": True}],
        limit=10,
    )
    weekly_top_pages_raw = ga_client.run_report(
        start_date=ga_week_start,
        end_date=ga_week_end,
        dimensions=["pagePath"],
        metrics=["screenPageViews"],
        order_bys=[{"metric": {"metricName": "screenPageViews"}, "desc": True}],
        limit=20,
    )

    weekly_top_pages = []
    for row in weekly_top_pages_raw:
        path = normalise_path(row["dimensions"][0])
        if not path:
            continue
        weekly_top_pages.append({"path": path, "views": to_int(row["metrics"][0])})
        if len(weekly_top_pages) == 8:
            break

    weekly_event_counts = {row["dimensions"][0]: to_int(row["metrics"][0]) for row in weekly_events}
    weekly_ga = {
        "sessions": to_int(weekly_overall["metrics"][0]),
        "pageViews": to_int(weekly_overall["metrics"][1]),
        "users": to_int(weekly_overall["metrics"][2]),
        "newUsers": to_int(weekly_overall["metrics"][3]),
        "avgSessionDuration": to_int(weekly_overall["metrics"][4]),
        "topPages": weekly_top_pages,
        "trafficSources": bucket_sources(
            weekly_sources, to_int(weekly_overall["metrics"][0]), percent=True
        ),
        "ctaClicks": weekly_event_counts.get("cta_click", 0),
        "leads": weekly_event_counts.get("generate_lead", 0),
    }

    period_overall = ga_client.run_report(
        start_date=period_start,
        end_date=period_end,
        metrics=["sessions", "screenPageViews", "activeUsers", "newUsers"],
    )[0]
    period_events = ga_client.run_report(
        start_date=period_start,
        end_date=period_end,
        dimensions=["eventName"],
        metrics=["eventCount", "totalUsers"],
        order_bys=[{"metric": {"metricName": "eventCount"}, "desc": True}],
        limit=20,
    )
    period_sources = ga_client.run_report(
        start_date=period_start,
        end_date=period_end,
        dimensions=["sessionDefaultChannelGroup"],
        metrics=["sessions"],
        order_bys=[{"metric": {"metricName": "sessions"}, "desc": True}],
        limit=10,
    )
    countries_raw = ga_client.run_report(
        start_date=period_start,
        end_date=period_end,
        dimensions=["country"],
        metrics=["activeUsers"],
        order_bys=[{"metric": {"metricName": "activeUsers"}, "desc": True}],
        limit=8,
    )
    page_engagement_raw = ga_client.run_report(
        start_date=period_start,
        end_date=period_end,
        dimensions=["pageTitle"],
        metrics=[
            "screenPageViews",
            "sessions",
            "activeUsers",
            "averageSessionDuration",
            "bounceRate",
        ],
        order_bys=[{"metric": {"metricName": "screenPageViews"}, "desc": True}],
        limit=30,
    )
    cta_breakdown_raw = ga_client.run_report(
        start_date=period_start,
        end_date=period_end,
        dimensions=["customEvent:event_label"],
        metrics=["eventCount"],
        dimension_filter={
            "filter": {
                "fieldName": "eventName",
                "stringFilter": {"matchType": "EXACT", "value": "cta_click"},
            }
        },
        order_bys=[{"metric": {"metricName": "eventCount"}, "desc": True}],
        limit=12,
    )

    page_engagement = build_page_engagement(page_engagement_raw)
    page_lookup = {page["page"]: page for page in page_engagement}
    period_event_counts = {row["dimensions"][0]: to_int(row["metrics"][0]) for row in period_events}
    period_event_users = {row["dimensions"][0]: to_int(row["metrics"][1]) for row in period_events}

    reports["lastUpdated"] = latest_report_date.isoformat()
    reports["ga4Period"] = {
        "start": period_start.isoformat(),
        "end": period_end.isoformat(),
        "totalSessions": to_int(period_overall["metrics"][0]),
        "totalPageViews": to_int(period_overall["metrics"][1]),
        "totalUsers": to_int(period_overall["metrics"][2]),
        "totalNewUsers": to_int(period_overall["metrics"][3]),
        "totalCTAClicks": period_event_counts.get("cta_click", 0),
        "totalLeads": period_event_counts.get("generate_lead", 0),
        "countries": [
            {"country": row["dimensions"][0], "users": to_int(row["metrics"][0])}
            for row in countries_raw
        ],
        "trafficSources": bucket_sources(
            period_sources, to_int(period_overall["metrics"][0]), percent=False
        ),
        "funnel": [
            {
                "step": "Landed on site",
                "users": to_int(period_overall["metrics"][2]),
                "description": "Active users who visited the site",
            },
            {
                "step": "Viewed homepage",
                "users": page_lookup.get("Homepage", {}).get("activeUsers", 0),
                "description": "Viewed the homepage",
            },
            {
                "step": "Visited contact page",
                "users": page_lookup.get("Contact", {}).get("activeUsers", 0),
                "description": "Viewed the contact page",
            },
            {
                "step": "Clicked a CTA",
                "users": period_event_users.get("cta_click", 0),
                "description": "Triggered a CTA click event",
            },
            {
                "step": "Became a lead",
                "users": period_event_users.get("generate_lead", 0),
                "description": "Triggered a generate_lead event",
            },
        ],
        "pageBounceRates": [
            {"page": page["page"], "bounceRate": page["bounceRate"]}
            for page in page_engagement
        ],
        "ctaBreakdown": [
            {
                "button": humanise_cta_label(row["dimensions"][0]),
                "clicks": to_int(row["metrics"][0]),
            }
            for row in cta_breakdown_raw
            if row["dimensions"][0] and row["dimensions"][0] != "(not set)"
        ],
        "navigationFlow": reports.get("ga4Period", {}).get("navigationFlow", {}),
        "pageEngagement": page_engagement,
        "exitPages": build_exit_pages(page_engagement),
        "seoInsights": refresh_search_console(
            search_console_client, start_date=period_start, end_date=period_end
        ),
    }

    email_defaults = (
        reports.get("weeks", [{}])[0].get("email")
        if reports.get("weeks")
        else {"campaignsSent": 0, "totalRecipients": 0, "openRate": 0, "clickRate": 0, "unsubscribes": 0}
    )
    reports["weeks"] = [
        {
            "weekEnding": week_label,
            "ga": weekly_ga,
            "linkedin": linkedin_week["linkedin"],
            "email": email_defaults,
        }
    ] + [week for week in reports.get("weeks", []) if week.get("weekEnding") != week_label]

    with REPORTS_PATH.open("w", encoding="utf-8") as handle:
        json.dump(reports, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print("Updated reports.json")
    print(f"  Last updated: {reports['lastUpdated']}")
    print(
        "  Latest GA week:",
        weekly_ga["sessions"],
        "sessions,",
        weekly_ga["pageViews"],
        "page views,",
        weekly_ga["leads"],
        "leads",
    )
    print(
        "  Latest LinkedIn week:",
        linkedin_week["linkedin"]["followers"],
        "followers,",
        linkedin_week["linkedin"]["impressions"],
        "impressions,",
        f"{linkedin_week['linkedin']['engagementRate']}% engagement",
    )


if __name__ == "__main__":
    main()
