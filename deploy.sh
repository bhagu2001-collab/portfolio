#!/bin/bash
# Sync photos from Google Drive
python3 update_gallery.py

# Add and commit the updated photos.js
git add photos.js
git commit -m "Auto-sync photos from Google Drive"

# Push to GitHub (this will upload the changes to the live site)
git push origin main
