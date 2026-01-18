#!/bin/bash

# Build and package script for releases

set -e

echo "Building SiYuan Daily Nav Plugin..."

# Start docker if not running
docker-compose up -d

# Install dependencies
echo "Installing dependencies..."
docker exec siyuan-plugin-dev npm install

# Build
echo "Building plugin..."
docker exec siyuan-plugin-dev npm run build

# Get version from plugin.json
VERSION=$(grep -o '"version": "[^"]*"' plugin.json | cut -d'"' -f4)

echo "Creating release package for version ${VERSION}..."

# Create release package
cd dist
PACKAGE_NAME="siyuan-daily-nav-${VERSION}.zip"
zip -r "../${PACKAGE_NAME}" .
cd ..

echo "✅ Release package created: ${PACKAGE_NAME}"
echo ""
echo "Next steps:"
echo "1. Test the plugin by extracting ${PACKAGE_NAME} to your SiYuan plugins folder"
echo "2. Create a git tag: git tag v${VERSION}"
echo "3. Push the tag: git push origin v${VERSION}"
echo "4. Create a GitHub release and upload ${PACKAGE_NAME}"
