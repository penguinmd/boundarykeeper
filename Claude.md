# Claude Notes

## Production Reminders

### REMOVE BEFORE PRODUCTION: Download Button

**File:** `client/src/components/AnalysisResults.jsx`

There is a temporary download button added for development purposes that allows downloading all generated text (original, grey rock, and yellow rock versions) along with model names.

**What to remove:**

1. The `handleDownload` function (lines ~13-57, marked with `// TEMPORARY: Download function for development - remove in production`)

2. The download button JSX at the bottom of the component (marked with `{/* TEMPORARY: Download button - remove in production */}`)

Search for "TEMPORARY" comments in the file to find all code that needs to be removed.
