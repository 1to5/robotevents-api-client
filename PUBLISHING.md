# Publishing Guide - GitHub Packages

This document explains how to publish the RoboEvents API Client package to GitHub Packages.

## Prerequisites

### 1. GitHub Personal Access Token

Create a GitHub Personal Access Token with the following permissions:

- `write:packages` - To publish packages
- `read:packages` - To install packages
- `repo` - If the repository is private

Create token at: <https://github.com/settings/tokens>

### 2. Environment Setup

Set your GitHub token as an environment variable:

```bash
# Add to your ~/.bashrc, ~/.zshrc, or ~/.profile
export GITHUB_TOKEN=your_github_personal_access_token_here

# Or set it temporarily
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### 3. Authentication

Authenticate with GitHub Packages:

```bash
# Login to GitHub Packages
npm login --scope=@1to5 --registry=https://npm.pkg.github.com

# Or configure globally
echo "@1to5:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc
```

## Publishing Methods

### Method 1: Automated Script (Recommended)

Use the provided publish script:

```bash
# Make sure you're in the project root
cd robotevents-api-client

# Run the publish script
./scripts/publish.sh
```

The script will:

1. ✅ Run tests to ensure quality
2. ✅ Prompt for version type (patch/minor/major)
3. ✅ Update package.json version
4. ✅ Create git tag
5. ✅ Publish to GitHub Packages
6. ✅ Provide next steps

### Method 2: Manual Publishing

For manual control over the process:

```bash
# 1. Run tests
npm test

# 2. Update version (choose one)
npm version patch   # For bug fixes (1.0.0 -> 1.0.1)
npm version minor   # For new features (1.0.0 -> 1.1.0)
npm version major   # For breaking changes (1.0.0 -> 2.0.0)

# 3. Publish
npm publish

# 4. Push tags
git push && git push --tags
```

### Method 3: GitHub Actions (Fully Automated)

For completely automated publishing on tag creation:

```bash
# 1. Update version and create tag
npm version patch  # or minor/major

# 2. Push tag (this triggers GitHub Action)
git push && git push --tags
```

The GitHub Action will:

- ✅ Run all tests
- ✅ Generate coverage report
- ✅ Publish to GitHub Packages
- ✅ Create GitHub Release

## Package Installation

### For Package Users

After publishing, users can install the package:

```bash
# Configure npm to use GitHub Packages for @1to5 scope
echo "@1to5:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Install the package
npm install @1to5/robotevents-api-client
```

### Usage Example

```javascript
import { RobotEventsClient } from '@1to5/robotevents-api-client';

const client = new RobotEventsClient({
  authToken: process.env.ROBOTEVENTS_TOKEN
});

const events = await client.getEvents({ per_page: 10 });
console.log(`Found ${events.data.length} events`);
```

## Version Management

### Semantic Versioning

Follow semantic versioning (semver):

- **PATCH** (1.0.0 → 1.0.1): Bug fixes, documentation updates
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes

### Pre-release Versions

For beta/alpha releases:

```bash
# Create pre-release version
npm version prerelease --preid=beta  # 1.0.0 -> 1.0.1-beta.0
npm version prerelease --preid=alpha # 1.0.0 -> 1.0.1-alpha.0

# Publish with beta/alpha tag
npm publish --tag beta
npm publish --tag alpha
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**

   ```bash
   # Re-login to GitHub Packages
   npm logout --scope=@1to5 --registry=https://npm.pkg.github.com
   npm login --scope=@1to5 --registry=https://npm.pkg.github.com
   ```

2. **Version Already Exists**

   ```bash
   # Check existing versions
   npm view @1to5/robotevents-api-client versions --json
   
   # Update to next available version
   npm version patch
   ```

3. **Permission Denied**
   - Verify GitHub token has `write:packages` permission
   - Ensure token hasn't expired
   - Check repository permissions

### Package Visibility

GitHub Packages are visible to:

- ✅ Repository collaborators
- ✅ Organization members (if applicable)
- ✅ Anyone with the repository link (if public repo)

## Monitoring

### Package Statistics

Monitor package usage:

- GitHub Package page: <https://github.com/1to5/robotevents-api-client/packages>
- Download statistics in repository Insights
- Package dependency graph

### CI/CD Status

Check build status:

- Actions tab: <https://github.com/1to5/robotevents-api-client/actions>
- Test coverage reports
- Release deployment status

## Best Practices

1. **Always test before publishing**

   ```bash
   npm test && npm run test:coverage
   ```

2. **Use meaningful commit messages**

   ```bash
   git commit -m "feat: add new caching mechanism"
   git commit -m "fix: resolve pagination bug"
   git commit -m "docs: update API documentation"
   ```

3. **Keep CHANGELOG updated**
   - Document all changes
   - Include breaking changes
   - Mention migration steps

4. **Review package contents**

   ```bash
   # See what will be published
   npm pack --dry-run
   
   # Create tarball to inspect
   npm pack
   tar -tzf 1to5-robotevents-api-client-1.0.0.tgz
   ```

## Support

For issues with publishing:

1. Check GitHub Actions logs
2. Verify GitHub token permissions
3. Review npm registry configuration
4. Check package.json configuration

---

**Happy Publishing! 🚀**
