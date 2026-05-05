#!/bin/bash
echo "🚀 Publishing latest changes..."

# Step 1: Sync from sandbox (placeholder for now)
echo "Syncing files..."

# Step 2: Build
npm run build

# Step 3: Deploy
echo "Uploading to Sitello..."
./deploy.sh

echo "✅ Published successfully!"
