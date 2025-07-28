#!/bin/bash

# RoboEvents API Client - Publish Script for GitHub Packages
# This script helps publish the package to GitHub Packages

set -e  # Exit on any error

echo "🚀 RoboEvents API Client - GitHub Packages Publish Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Git working directory is not clean. Please commit or stash changes first."
    git status
    exit 1
fi

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is not set."
    echo "Please set your GitHub Personal Access Token:"
    echo "export GITHUB_TOKEN=your_github_token_here"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test

# Ask for version type
echo ""
echo "📦 Current version: $(node -p "require('./package.json').version")"
echo "What type of version bump would you like?"
echo "1) patch (bug fixes)"
echo "2) minor (new features)"  
echo "3) major (breaking changes)"
echo "4) custom version"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
        VERSION_TYPE="$CUSTOM_VERSION"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

# Update version
echo "📈 Updating version..."
if [ "$choice" -eq 4 ]; then
    npm version "$VERSION_TYPE" --no-git-tag-version
    git add package.json package-lock.json
    git commit -m "chore: bump version to $VERSION_TYPE"
    git tag "v$VERSION_TYPE"
else
    npm version "$VERSION_TYPE"
fi

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Version updated to: $NEW_VERSION"

# Confirm publication
echo ""
read -p "🤔 Are you sure you want to publish v$NEW_VERSION to GitHub Packages? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Publication cancelled."
    exit 1
fi

# Publish to GitHub Packages
echo "📤 Publishing to GitHub Packages..."
npm publish

echo ""
echo "🎉 Successfully published @1to5/robotevents-api-client@$NEW_VERSION"
echo ""
echo "📋 Next steps:"
echo "1. Push the version tag: git push && git push --tags"
echo "2. The GitHub Action will create a release automatically"
echo "3. Users can install with: npm install @1to5/robotevents-api-client@$NEW_VERSION"
echo ""
echo "🔗 Package URL: https://github.com/1to5/robotevents-api-client/packages"