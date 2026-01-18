# SiYuan Daily Note Navigation Plugin

Navigate between daily notes with keyboard shortcuts for previous and next day.

## Features

- 📅 **Go to Previous Day** (⌥⌘← / Option+Command+Left Arrow): Navigate to the previous day's daily note
- 📅 **Go to Next Day** (⌥⌘→ / Option+Command+Right Arrow): Navigate to the next day's daily note
- ✨ **Auto-create**: If a daily note doesn't exist, it will be created automatically using your notebook's daily note format
- 🎯 **Smart notebook selection**: Creates notes in the same notebook when navigating from a daily note
- ⚙️ **Configurable fallback**: Set a default notebook for creating daily notes when not in a daily note
- 🏷️ **Custom attributes**: Automatically adds `custom-dailynote-YYYYMMDD` attribute for easy identification
- 🔄 **Respects SiYuan settings**: Honors your "open in current tab" preference
- 🚀 **Works everywhere**: Use shortcuts while typing without interference

## Building the Plugin

### Using Docker (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **Enter the container:**
   ```bash
   docker exec -it siyuan-plugin-dev sh
   ```

3. **Inside the container, install dependencies:**
   ```bash
   npm install
   ```

4. **Build the plugin:**
   ```bash
   npm run build
   ```

   Or for development with auto-rebuild:
   ```bash
   npm run dev
   ```

5. **Exit the container:**
   ```bash
   exit
   ```

The built plugin will be in the `dist/` directory.

### Without Docker

If you have Node.js installed locally:

```bash
npm install
npm run build
```

## Installation

1. Build the plugin (see above)
2. Copy the entire `dist/` folder to your SiYuan plugins directory:
   - Windows: `{workspace}/data/plugins/`
   - macOS: `{workspace}/data/plugins/`
   - Linux: `{workspace}/data/plugins/`
3. Rename the `dist` folder to `siyuan-daily-nav`
4. Restart SiYuan or reload plugins

## Installation

### From SiYuan Marketplace (Recommended)
1. Open SiYuan → Settings → Marketplace → Plugins
2. Search for "Daily Note Navigation"
3. Click Install
4. Enable the plugin

### Manual Installation
1. Download the latest release from [Releases](https://github.com/c00llin/siyuan-daily-nav/releases)
2. Extract to `{workspace}/data/plugins/`
3. Restart SiYuan or reload plugins

## Usage

### Basic Navigation
1. Open any daily note in SiYuan
2. Use the keyboard shortcuts:
   - **⌥⌘← (Option+Command+Left Arrow)** - Go to previous day
   - **⌥⌘→ (Option+Command+Right Arrow)** - Go to next day
3. If the daily note for that day doesn't exist, it will be created automatically

You can also find these commands in the Command Palette (Ctrl+P / ⌘P).

### Configuration
1. Go to Settings → Marketplace → Downloaded
2. Find "Daily Note Navigation" and click the ⚙️ icon
3. Select a **fallback notebook** for creating daily notes when you're not currently in a daily note

### How It Works

**When in a daily note:**
- Navigates to the previous/next day's note in the same notebook
- Uses that notebook's daily note format configuration
- Creates new notes with the same format (e.g., "2026-01-17 Saturday")

**When NOT in a daily note:**
- Navigates to today's daily note
- Uses the fallback notebook you configured
- Creates notes with that notebook's format

## Development

See [Building the Plugin](#building-the-plugin) section above for development setup.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - See [LICENSE](LICENSE) file for details.

## Changelog

### v0.0.1 (Initial Release)
- Navigate between daily notes with keyboard shortcuts
- Auto-create missing daily notes
- Respect notebook daily note configurations
- Configurable fallback notebook
- Custom attribute tagging
- Respect SiYuan's tab opening preferences
