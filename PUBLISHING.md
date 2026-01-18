# Publishing to SiYuan Marketplace

This guide will help you publish this plugin to the SiYuan marketplace.

## Prerequisites

- GitHub account
- Git installed locally

## Steps

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `siyuan-daily-nav`
3. Make it **public** (required for SiYuan marketplace)
4. Don't initialize with README (we already have one)

### 2. Initialize Git and Push

```bash
cd /Users/collinjanssen/Sync/ClaudeCode/siyuan-daily-nav

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Daily Note Navigation Plugin v0.0.1"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/siyuan-daily-nav.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Create a Release

1. Go to your repository on GitHub
2. Click on "Releases" → "Create a new release"
3. Click "Choose a tag" and type `v0.0.1` (then click "Create new tag")
4. Release title: `v0.0.1 - Initial Release`
5. Description: Copy from CHANGELOG.md
6. Click "Publish release"

### 4. Build and Upload Plugin Package

```bash
# Build the plugin
docker-compose up -d
docker exec siyuan-plugin-dev npm run build

# Create a release package
cd dist
zip -r ../siyuan-daily-nav-0.0.1.zip .
cd ..
```

Upload `siyuan-daily-nav-0.0.1.zip` to the GitHub release as an asset.

### 5. Add Preview Image (Optional but Recommended)

Create a screenshot or preview image showing the plugin in action:
- Take a screenshot of SiYuan showing the plugin settings or in use
- Name it `preview.png`
- Add it to the repository root
- Dimensions: ideally 1024x768 or similar
- Commit and push:

```bash
git add preview.png
git commit -m "Add preview image"
git push
```

### 6. Submit to SiYuan Marketplace

1. Fork the SiYuan bazaar repository: https://github.com/siyuan-note/bazaar
2. Clone your fork locally
3. Add your plugin to `plugins.json`:

```json
{
  "name": "siyuan-daily-nav",
  "author": "YOUR_USERNAME",
  "url": "https://github.com/YOUR_USERNAME/siyuan-daily-nav",
  "version": "0.0.1",
  "minAppVersion": "2.9.0",
  "displayName": {
    "en_US": "Daily Note Navigation",
    "zh_CN": "日记导航"
  },
  "description": {
    "en_US": "Navigate between daily notes with previous/next day commands",
    "zh_CN": "使用上一天/下一天命令在日记之间导航"
  },
  "readme": {
    "en_US": "README.md",
    "zh_CN": "README.md"
  },
  "funding": {
    "custom": []
  },
  "keywords": [
    "daily-note",
    "navigation",
    "productivity"
  ]
}
```

4. Commit your changes:

```bash
git add plugins.json
git commit -m "Add Daily Note Navigation plugin"
git push
```

5. Create a Pull Request to the main bazaar repository
6. Wait for review and approval from SiYuan maintainers

### 7. Future Updates

When releasing a new version:

1. Update version in `plugin.json`
2. Update `CHANGELOG.md`
3. Rebuild: `docker exec siyuan-plugin-dev npm run build`
4. Commit and push changes
5. Create a new GitHub release with the new version tag
6. Upload the new build zip to the release
7. Update `plugins.json` in the bazaar repository with the new version
8. Create a PR to the bazaar repository

## Notes

- SiYuan marketplace reviews can take a few days
- Make sure your repository stays public
- Keep your releases well-documented
- Respond to issues and pull requests from users

## References

- [SiYuan Plugin Development Guide](https://github.com/siyuan-note/plugin-sample)
- [SiYuan Bazaar Repository](https://github.com/siyuan-note/bazaar)
