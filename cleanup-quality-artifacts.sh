#!/bin/bash

# Clean up quality analysis artifacts from root directory
echo "Cleaning up quality analysis artifacts..."

# Remove directories that should not be at root
rm -rf reports/ 2>/dev/null || true
rm -rf temp/ 2>/dev/null || true
rm -rf report/ 2>/dev/null || true

# Remove any temporary files
rm -f temp/args.json 2>/dev/null || true

echo "Cleanup completed!"
