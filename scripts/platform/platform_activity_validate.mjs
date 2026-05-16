import { getActivityFeed, getActivityTaxonomy } from "../../platform/activity/activity_feed.mjs";

const REQUIRED_TYPES = [
  "system",
  "operator",
  "cadence",
  "notification",
  "deploy",
  "backup",
  "tenant",
  "health",
  "api",
];
const REQUIRED_SEVERITIES = ["info", "success", "warning", "error"];

function fail(message, failures) {
  failures.push(message);
}

function validateTaxonomy(taxonomy) {
  const failures = [];
  const warnings = [];
  const types = taxonomy?.types || {};
  const severities = taxonomy?.severities || {};

  for (const type of REQUIRED_TYPES) {
    if (!types[type]) {
      fail(`Missing activity type: ${type}`, failures);
      continue;
    }
    for (const field of ["label", "description", "visualHint", "defaultSeverity"]) {
      if (!types[type][field]) fail(`Type ${type} is missing ${field}`, failures);
    }
    if (typeof types[type].showInDashboard !== "boolean") {
      fail(`Type ${type} must define showInDashboard as boolean`, failures);
    }
    if (types[type].defaultSeverity && !REQUIRED_SEVERITIES.includes(types[type].defaultSeverity)) {
      fail(`Type ${type} has invalid defaultSeverity: ${types[type].defaultSeverity}`, failures);
    }
  }

  for (const severity of REQUIRED_SEVERITIES) {
    if (!severities[severity]) {
      fail(`Missing activity severity: ${severity}`, failures);
      continue;
    }
    for (const field of ["label", "description", "visualHint"]) {
      if (!severities[severity][field]) fail(`Severity ${severity} is missing ${field}`, failures);
    }
  }

  for (const type of Object.keys(types)) {
    if (!REQUIRED_TYPES.includes(type)) warnings.push(`Extra activity type present: ${type}`);
  }

  for (const severity of Object.keys(severities)) {
    if (!REQUIRED_SEVERITIES.includes(severity)) warnings.push(`Extra activity severity present: ${severity}`);
  }

  return { failures, warnings };
}

function validateFeed(entries, taxonomy) {
  const failures = [];
  const warnings = [];
  const types = taxonomy?.types || {};
  const severities = taxonomy?.severities || {};

  for (const entry of entries) {
    if (!types[entry.type]) fail(`Entry ${entry.id || "unknown"} has invalid type: ${entry.type}`, failures);
    if (!severities[entry.severity]) fail(`Entry ${entry.id || "unknown"} has invalid severity: ${entry.severity}`, failures);
    if (!entry.displayLabel) fail(`Entry ${entry.id || "unknown"} is missing displayLabel`, failures);
    if (!entry.visualHint) fail(`Entry ${entry.id || "unknown"} is missing visualHint`, failures);
  }

  if (!entries.length) warnings.push("No activity entries generated locally. Taxonomy still validated.");

  return { failures, warnings };
}

const taxonomy = getActivityTaxonomy();
const taxonomyResult = validateTaxonomy(taxonomy);
const entries = getActivityFeed({ tenantId: process.env.PLATFORM_TENANT || "erp-experts", limit: 50 });
const feedResult = validateFeed(entries, taxonomy);
const failures = [...taxonomyResult.failures, ...feedResult.failures];
const warnings = [...taxonomyResult.warnings, ...feedResult.warnings];

console.log("Sentinel Activity Taxonomy Validation");
console.log("");
console.log(`Types: ${Object.keys(taxonomy.types || {}).length}`);
console.log(`Severities: ${Object.keys(taxonomy.severities || {}).length}`);
console.log(`Entries checked: ${entries.length}`);

if (warnings.length) {
  console.log("");
  console.log("Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (failures.length) {
  console.log("");
  console.log("Failures:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Status: PASS");
