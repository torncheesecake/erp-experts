#!/bin/bash
cd "/Users/matthewhillman/Documents/E3/Wesbite redesign/erp-experts-pink"

jq '
  .weeks[0].ga4Period.seoInsights.allLandingPages = [] |
  .weeks[0].ga4Period.seoInsights.roadmapPhases = []
' src/data/reports.json > src/data/reports.json.tmp && mv src/data/reports.json.tmp src/data/reports.json

echo "✅ GA4 SEO insights fields added"
