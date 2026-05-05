"""
Parse the monthly GA4 snapshot (snapshot-3) to extract weekly data.
Period 1: Jan 20 - Feb 18, 2026 (30 days, day 0 = Jan 20)
Period 2: Dec 23 - Jan 21, 2026 (30 days, day 0 = Dec 23)
"""

from datetime import date, timedelta

# Period 1: Jan 20 - Feb 18
p1_start = date(2026, 1, 20)
# Period 2: Dec 23 - Jan 21
p2_start = date(2025, 12, 23)

# Active users daily - Period 1
p1_users = [
    1,
    2,
    5,
    1,
    0,
    1,
    2,
    0,
    2,
    4,
    6,
    1,
    0,
    7,
    12,
    24,
    27,
    4,
    4,
    0,
    6,
    3,
    2,
    8,
    6,
    1,
    1,
    6,
    5,
    8,
]
# Active users daily - Period 2
p2_users = [
    0,
    0,
    0,
    1,
    0,
    2,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    3,
    4,
    1,
    1,
    1,
    2,
    0,
    5,
    2,
    6,
    2,
    1,
    1,
    0,
    0,
    1,
    2,
]

# New users daily - Period 1
p1_new = [
    1,
    0,
    3,
    0,
    0,
    0,
    0,
    0,
    1,
    3,
    2,
    0,
    0,
    2,
    8,
    17,
    19,
    2,
    3,
    0,
    1,
    3,
    1,
    4,
    6,
    1,
    0,
    3,
    1,
    5,
]
# New users daily - Period 2
p2_new = [
    0,
    0,
    0,
    1,
    0,
    2,
    1,
    0,
    0,
    0,
    0,
    0,
    1,
    2,
    3,
    1,
    1,
    1,
    1,
    0,
    4,
    2,
    4,
    1,
    1,
    0,
    0,
    0,
    1,
    0,
]

# Sessions by channel - Period 1
# Direct=127, Organic=106, Referral=10, Unassigned=5, Social=1 = 249
p1_total_sessions = 249

# Sessions by channel - Period 2
# Direct=16, Organic=35, Referral=1, Unassigned=2, Social=0 = 54
p2_total_sessions = 54

# Page views - Period 1: 1490, Period 2: 109
p1_pageviews = 1490
p2_pageviews = 109

# CTA clicks - Period 1: 112, Period 2: 0
p1_cta = 112
p2_cta = 0

# Leads - Period 1: 4 (3 key events), Period 2: 1
p1_leads = 4
p2_leads = 1

# Traffic sources Period 1
p1_sources = {
    "organic": round(106 / 249 * 100),
    "direct": round(127 / 249 * 100),
    "referral": round(10 / 249 * 100),
    "social": round(1 / 249 * 100),
}

# Traffic sources Period 2
p2_sources = {
    "organic": round(35 / 54 * 100),
    "direct": round(16 / 54 * 100),
    "referral": round(1 / 54 * 100),
    "social": 0,
}


# Now bucket into weeks (Mon-Sun)
def get_week_key(d):
    """Return the Sunday ending the week containing d"""
    days_to_sunday = (6 - d.weekday()) % 7
    return d + timedelta(days=days_to_sunday)


def bucket_daily(start_date, daily_values):
    weeks = {}
    for i, val in enumerate(daily_values):
        d = start_date + timedelta(days=i)
        wk = get_week_key(d).isoformat()
        weeks.setdefault(wk, []).append(val)
    return {k: sum(v) for k, v in weeks.items()}


# Combine both periods
all_users = {}
all_new = {}

for wk, total in bucket_daily(p1_start, p1_users).items():
    all_users[wk] = total
for wk, total in bucket_daily(p2_start, p2_users).items():
    all_users.setdefault(wk, 0)
    all_users[wk] = max(all_users[wk], total)  # don't double count overlapping weeks

for wk, total in bucket_daily(p1_start, p1_new).items():
    all_new[wk] = total
for wk, total in bucket_daily(p2_start, p2_new).items():
    all_new.setdefault(wk, 0)
    all_new[wk] = max(all_new[wk], total)

print("=== GA4 WEEKLY BREAKDOWN ===")
print()
for wk in sorted(all_users.keys()):
    print(f"Week ending {wk}:")
    print(f"  Active Users: {all_users.get(wk, '?')}")
    print(f"  New Users: {all_new.get(wk, '?')}")

# Also compute proportional sessions/pageviews per week based on user distribution
print()
print("=== SESSION/PAGEVIEW ESTIMATES (proportional to daily users) ===")
p1_user_total = sum(p1_users)
p1_weekly_users = bucket_daily(p1_start, p1_users)
for wk in sorted(p1_weekly_users.keys()):
    ratio = p1_weekly_users[wk] / p1_user_total if p1_user_total else 0
    est_sessions = round(p1_total_sessions * ratio)
    est_pageviews = round(p1_pageviews * ratio)
    est_cta = round(p1_cta * ratio)
    print(
        f"  {wk}: sessions~{est_sessions}, pageviews~{est_pageviews}, cta~{est_cta} (users={p1_weekly_users[wk]})"
    )

p2_user_total = sum(p2_users)
p2_weekly_users = bucket_daily(p2_start, p2_users)
for wk in sorted(p2_weekly_users.keys()):
    ratio = p2_weekly_users[wk] / p2_user_total if p2_user_total else 0
    est_sessions = round(p2_total_sessions * ratio)
    est_pageviews = round(p2_pageviews * ratio)
    print(
        f"  {wk}: sessions~{est_sessions}, pageviews~{est_pageviews} (users={p2_weekly_users[wk]})"
    )

# Top pages for the month (new site)
print()
print("=== TOP PAGES (Jan 20 - Feb 18) ===")
pages = [
    ("/", 571),
    ("/case-studies", 162),
    ("/support", 112),
    ("/implementation", 90),
    ("/contact", 69),
    ("/about", 67),
    ("/resources", 49),
    ("/case-studies/eco2solar", 44),
    ("/case-studies/carallon", 33),
    ("/case-studies/totalkare", 31),
    ("/case-studies/kynetec", 26),
    ("/terms", 16),
    ("/what-is-netsuite", 13),
]
for path, views in pages:
    print(f"  {path}: {views}")
