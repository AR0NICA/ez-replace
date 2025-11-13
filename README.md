<div align="center">

# EZ Replace

### Supercharge Your Text Editing in Obsidian

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/AR0NICA/ez-replace)
[![Obsidian](https://img.shields.io/badge/Obsidian-0.15.0+-purple.svg)](https://obsidian.md/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**A powerful Obsidian plugin for lightning-fast text replacement with customizable word pairs and auto-complete suggestions**


</div>

---

## Overview

EZ Replace transforms the way you work with text in Obsidian. Define your own text replacement pairs and replace them instantly with a single hotkey. Perfect for inserting special characters, mathematical symbols, or any frequently used text snippets.

### Why EZ Replace?

- **Save Time**: Replace `->` with `→` in a single keystroke
- **Auto-Complete**: Get suggestions as you type with smart matching
- **Stay Focused**: No need to search for special characters or break your flow
- **Fully Customizable**: Create unlimited replacement pairs tailored to your needs
- **Smart Matching**: Case-sensitive and whole-word matching options
- **Portable**: Export and import your settings across different vaults

---

## Features

<table>
<tr>
<td width="50%">

### Core Functionality
- **One-key Replacement**: Press your hotkey to instantly replace selected text
- **Auto-Complete Suggester**: Get real-time suggestions as you type
- **Custom Pairs**: Define unlimited source → target text pairs
- **Quick Toggle**: Enable/disable pairs without deleting them
- **Smart Reordering**: Move frequently used pairs to the top

</td>
<td width="50%">

### Advanced Options
- **Case Sensitivity**: Match text with exact case or ignore it
- **Whole Word Matching**: Replace only complete words, not parts
- **Descriptions**: Add notes to remember what each pair is for
- **Hotkey Customization**: Set your preferred keyboard shortcut
- **Smart Matching Modes**: Choose between prefix or fuzzy matching
- **Customizable Accept Keys**: Use Tab, Enter, or both to confirm suggestions

</td>
</tr>
<tr>
<td width="50%">

### Data Management
- **JSON Export**: Backup all your replacement pairs
- **Flexible Import**: Replace or merge with existing pairs
- **Example Library**: 10 pre-made pairs to get started
- **Cross-Vault Sync**: Share settings between vaults

</td>
<td width="50%">

### User Experience
- **Intuitive UI**: Clean, organized settings interface
- **Visual Feedback**: Clear indication of current settings
- **Quick Access**: Command palette integration
- **Default Pairs**: 4 useful pairs included out of the box

</td>
</tr>
</table>

---

## Getting Started

### Installation

#### Manual Installation

1. Download the latest release files:
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Create the plugin folder:
   ```
   <your-vault>/.obsidian/plugins/ez-replace/
   ```

3. Copy the downloaded files into this folder

4. Restart Obsidian or reload with `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)

5. Go to **Settings → Community Plugins** and enable **EZ Replace**

#### For Developers

```bash
# Clone the repository
git clone https://github.com/AR0NICA/ez-replace.git
cd ez-replace

# Install dependencies
npm install

# Build the plugin
npm run build

# Copy files to your vault
cp main.js manifest.json styles.css <your-vault>/.obsidian/plugins/ez-replace/
```

### Quick Start Guide

1. **Open Settings**
   - Navigate to `Settings → EZ Replace`
   - Or use Command Palette: `EZ Replace: Open settings`

2. **Configure Your Hotkey**
   - In the settings, find **"Hotkey Configuration"** section
   - Click **"Configure Hotkey"** button
   - Set your preferred keyboard shortcut (e.g., `Ctrl+Shift+R`)

3. **Try the Default Pairs**
   - Select `->` in your note
   - Press your configured hotkey
   - Watch it transform to `→`

4. **Create Your First Custom Pair**
   - Click **"Add pair"** button
   - Enter source text (e.g., `alpha`)
   - Enter target text (e.g., `α`)
   - Start using it immediately!

---

## Usage

### Managing Replacement Pairs

<details>
<summary><strong>Adding a New Pair</strong></summary>

1. Go to `Settings → EZ Replace`
2. Click the **"Add pair"** button
3. Fill in the fields:
   - **Source**: The text you want to replace (e.g., `->`)
   - **Target**: The text to replace it with (e.g., `→`)
4. The pair is saved automatically

</details>

<details>
<summary><strong>Reordering Pairs</strong></summary>

- Use **↑** and **↓** buttons to move pairs up or down
- Place frequently used pairs at the top for faster matching
- Changes are saved automatically

</details>

<details>
<summary><strong>Advanced Options</strong></summary>

Click the **⚙️ (gear icon)** on any pair to access:

- **Description**: Add a note about what this pair does
- **Case Sensitive**: 
  - `ON`: "Hello" and "hello" are different
  - `OFF`: Matches regardless of case
- **Whole Word Match**: 
  - `ON`: "cat" won't match in "caterpillar"
  - `OFF`: Matches anywhere in text

</details>

### Using Auto-Complete Suggester

<details>
<summary><strong>Getting Started with Auto-Complete</strong></summary>

1. The suggester is **enabled by default**
2. Start typing any source text (e.g., type `al` for `alpha`)
3. Suggestions appear automatically after minimum characters (default: 2)
4. Press **Tab** or **Enter** to accept a suggestion
5. Continue typing normally to ignore suggestions

**How it works:**
- Suggester scans your enabled replacement pairs
- Shows matches based on your matching mode (prefix or fuzzy)
- Updates in real-time as you type
- No need to select text first!

</details>

<details>
<summary><strong>Configuring Suggester Settings</strong></summary>

Go to `Settings → EZ Replace → Auto-complete suggester` section:

**Enable auto-complete**
- Toggle on/off to enable or disable the suggester

**Minimum characters** (1-5)
- How many characters you need to type before suggestions appear
- Lower = more suggestions, Higher = more precise

**Maximum suggestions** (3-10)
- Limit how many suggestions to display at once
- Prevents overwhelming the popup

**Matching mode**
- **Prefix matching**: Matches from the start of source text
  - Type `al` → matches `alpha`, `alt`, but not `metal`
- **Fuzzy matching**: Matches characters in order anywhere
  - Type `al` → matches `alpha`, `animal`, `total`
  - Scored by relevance (start matches rank higher)

**Show descriptions**
- Display description text in the suggestion popup
- Helps identify what each replacement does

**Case sensitive matching**
- Match source text with exact case
- When off, `AL` and `al` are treated the same

**Confirmation keys**
- **Tab and Enter** (default): Both keys accept suggestions
- **Tab only**: Only Tab accepts, Enter creates new line
- **Enter only**: Only Enter accepts, Tab inserts tab space

</details>

<details>
<summary><strong>Tips for Best Results</strong></summary>

- **Use descriptive source text** - Short, memorable abbreviations work best
- **Adjust minimum characters** - Set to 1 for very short sources, 3+ for longer ones
- **Try fuzzy matching** - Great for finding pairs when you don't remember exact spelling
- **Customize accept keys** - Choose what works for your workflow
  - Markdown editing: Tab+Enter both work well
  - Code editing: Tab-only avoids accidental replacements on new lines
- **Disable when not needed** - Toggle off for pure manual replacement mode

</details>

### Customizing Your Hotkey

**Note**: EZ Replace does not set a default hotkey. You must configure one before using the plugin.

<details>
<summary><strong>Method 1: From Plugin Settings</strong></summary>

1. Open `Settings → EZ Replace`
2. Look for **"Hotkey Configuration"** at the top
3. Click **"Configure Hotkey"**
4. Set your preferred key combination (e.g., `Ctrl+Shift+R`)

</details>

<details>
<summary><strong>Method 2: From Obsidian Hotkeys</strong></summary>

1. Open `Settings → Hotkeys`
2. Search for `EZ Replace`
3. Find **"Replace selected text"**
4. Click to modify the hotkey

</details>

### Backup & Restore

<details>
<summary><strong>Exporting Your Settings</strong></summary>

1. Go to `Settings → EZ Replace`
2. Find **"Backup & Restore"** section
3. Click **"Export to JSON"**
4. A file named `ez-replace-backup-YYYYMMDD-HHMM.json` will be downloaded

**Use Cases:**
- Backup before major changes
- Share configurations with others
- Sync across multiple vaults

</details>

<details>
<summary><strong>Importing Settings</strong></summary>

1. Click **"Import from JSON"**
2. Select your backup file
3. Choose import mode:
   - **Replace**: Remove all current pairs and use imported ones
   - **Merge**: Keep current pairs and add imported ones
4. Confirm your choice

</details>

---

## Default Replacement Pairs

The plugin includes these ready-to-use pairs:

| Source | Target | Description |
|--------|--------|-------------|
| `->` | `→` | Right arrow |
| `<-` | `←` | Left arrow |
| `=>` | `⇒` | Double right arrow |
| `!=` | `≠` | Not equal |

### Example Pairs Library

Import `example-pairs.json` for 10 additional useful pairs:

<details>
<summary>View example pairs</summary>

| Source | Target | Description |
|--------|--------|-------------|
| `>=` | `≥` | Greater than or equal |
| `<=` | `≤` | Less than or equal |
| `alpha` | `α` | Greek letter alpha |
| `beta` | `β` | Greek letter beta |
| `infinity` | `∞` | Infinity symbol |
| `(c)` | `©` | Copyright symbol |

</details>

---

## JSON File Format

When you export settings, the file structure is:

```json
[
  {
    "id": "unique-identifier",
    "source": "->",
    "target": "→",
    "enabled": true,
    "description": "Right arrow",
    "caseSensitive": true,
    "wholeWord": false
  }
]
```

**Manual Editing Tips:**
- Create bulk pairs by copying the structure
- Use a JSON validator to check syntax
- Create category-specific files (e.g., `math-symbols.json`, `greek-letters.json`)

---

## Commands

The plugin registers these commands in the Command Palette (`Ctrl+P`):

| Command | Default Hotkey | Description |
|---------|---------------|-------------|
| `Replace selected text` | `Ctrl+Shift+R` | Replace the selected text with matching pair |
| `Open settings` | None | Quickly open plugin settings |

---

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Production build
npm run build
```

### Project Structure

```
ez-replace/
├── src/
│   ├── main.ts           # Plugin entry point
│   ├── settingsTab.ts    # Settings UI
│   ├── settings.ts       # Default settings
│   └── types.ts          # Type definitions
├── styles.css            # Plugin styles
├── manifest.json         # Plugin metadata
├── example-pairs.json    # Example configurations
└── README.md            # Documentation
```

---

## Troubleshooting

<details>
<summary><strong>Replacement not working</strong></summary>

- Check if the pair is enabled (toggle should be ON)
- Verify exact text match (check case sensitivity)
- Ensure text is selected before pressing hotkey
- Check if another plugin is using the same hotkey

</details>

<details>
<summary><strong>Import failed</strong></summary>

- Verify JSON file format is correct
- Check that each pair has `source` and `target` fields
- Try a fresh export to ensure valid format

</details>

<details>
<summary><strong>Hotkey not working</strong></summary>

- Check for conflicts in `Settings → Hotkeys`
- Try setting a different key combination
- Restart Obsidian after changing hotkeys

</details>

---

## Version History

### v1.1.0 (2025-11-13)

**Auto-Complete Suggester Release**

- **NEW: Auto-complete suggester** - Get real-time suggestions as you type
- **Prefix matching algorithm** - Match from the start of source text
- **Fuzzy matching algorithm** - Match characters in order with intelligent scoring
- **Customizable suggester settings** - 7 configuration options:
  - Enable/disable toggle
  - Minimum characters (1-5)
  - Maximum suggestions (3-10)
  - Matching mode (prefix/fuzzy)
  - Show descriptions toggle
  - Case sensitive matching
  - Confirmation keys (Tab/Enter/Both)
- **Tab and Enter key support** - Accept suggestions with your preferred key
- **Smart suggestion rendering** - Shows target, source, and optional description
- **Real-time suggestion updates** - Updates as you type with no lag

### v1.0.0 (2025-11-12)

**Initial Release**

- Text replacement with customizable hotkey
- Replacement pairs management (Add, Edit, Delete, Reorder)
- Enable/disable individual pairs
- Advanced options (Case-sensitive, Whole word matching, Description)
- JSON Export/Import (Replace & Merge modes)
- Hotkey configuration UI with quick access to settings
- Clean implementation following Obsidian best practices
- No default hotkey - user must configure their preferred shortcut

---

## Contributing

Contributions are welcome! Please feel free to:

- Report bugs or suggest features via GitHub Issues
- Submit pull requests for improvements
- Share your replacement pair collections
- Translate documentation to other languages

---

## License

MIT License - feel free to use and modify as needed.

---

## Support

If you find this plugin helpful, consider:

- Starring the repository on GitHub
- Sharing it with other Obsidian users
- Contributing to the project

---

<div align="center">

**Made with ❤️ for the Obsidian community**

[Report Bug](https://github.com/yourusername/ez-replace/issues) · [Request Feature](https://github.com/yourusername/ez-replace/issues)

</div>
