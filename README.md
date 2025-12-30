<div align="center">

# EZ Replace

### Supercharge Your Text Editing in Obsidian

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/AR0NICA/ez-replace)
[![Obsidian](https://img.shields.io/badge/Obsidian-0.15.0+-purple.svg)](https://obsidian.md/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A powerful Obsidian plugin for lightning-fast text replacement with customizable word pairs, regex support, and auto-complete suggestions.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Regex Support](#regex-support)
- [Default Replacement Pairs](#default-replacement-pairs)
- [JSON File Format](#json-file-format)
- [Commands](#commands)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Version History](#version-history)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

EZ Replace transforms the way you work with text in Obsidian. Define your own text replacement pairs and replace them instantly with a single hotkey. Perfect for inserting special characters, mathematical symbols, or any frequently used text snippets.

### Why EZ Replace?

- **Save Time**: Replace `->` with `→` in a single keystroke
- **Regex Power**: Use regular expressions with capture groups for advanced transformations
- **Auto-Complete**: Get suggestions as you type with smart matching
- **Stay Organized**: Categorize and search through your replacement pairs
- **Track Usage**: Monitor which pairs you use most frequently
- **Context-Aware**: Control where replacements apply (code blocks, headings, etc.)
- **Portable**: Export and import your settings across different vaults

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **One-key Replacement** | Press your hotkey to instantly replace selected text |
| **Auto-Complete Suggester** | Get real-time suggestions as you type |
| **Regex Support** | Use regular expressions with capture groups ($0-$9) |
| **Context-Aware Matching** | Control replacements based on document context |
| **Custom Pairs** | Define unlimited source to target text pairs |
| **Quick Toggle** | Enable/disable pairs without deleting them |

### Organization and Search (v1.2)

| Feature | Description |
|---------|-------------|
| **Search and Filter** | Find pairs quickly by source, target, or description |
| **Category Tags** | Organize pairs with custom tags (math, arrows, greek, etc.) |
| **Sorting Options** | Sort by name, date created, or usage frequency |
| **Usage Statistics** | Track how often each pair is used |
| **Statistics Dashboard** | View total replacements, top pairs, and export stats |

### Advanced Matching (v1.3)

| Feature | Description |
|---------|-------------|
| **Regex Mode** | Enable regex matching per pair with validation |
| **Capture Groups** | Use $0 (full match), $1-$9 in replacement target |
| **Regex Flags** | Support for case-insensitive (i), multiline (m), dotall (s), unicode (u) |
| **Regex Templates** | 18 pre-built patterns for common use cases |
| **Context Filtering** | Include/exclude specific contexts (code, headings, links, etc.) |

### Data Management

| Feature | Description |
|---------|-------------|
| **JSON Export** | Backup all your replacement pairs |
| **Flexible Import** | Replace or merge with existing pairs |
| **Example Library** | Pre-made pairs to get started |
| **Cross-Vault Sync** | Share settings between vaults |

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

5. Go to **Settings > Community Plugins** and enable **EZ Replace**

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
   - Navigate to `Settings > EZ Replace`
   - Or use Command Palette: `EZ Replace: Open settings`

2. **Configure Your Hotkey**
   - In the settings, find **Hotkey Configuration** section
   - Click **Configure Hotkey** button
   - Set your preferred keyboard shortcut

3. **Try the Default Pairs**
   - Select `->` in your note
   - Press your configured hotkey
   - Watch it transform to `→`

4. **Create Your First Custom Pair**
   - Click **Add pair** button
   - Enter source text (e.g., `alpha`)
   - Enter target text (e.g., `α`)
   - Start using it immediately

---

## Usage

### Managing Replacement Pairs

<details>
<summary><strong>Adding a New Pair</strong></summary>

1. Go to `Settings > EZ Replace`
2. Click the **Add pair** button
3. Fill in the fields:
   - **Source**: The text you want to replace (e.g., `->`)
   - **Target**: The text to replace it with (e.g., `→`)
4. The pair is saved automatically

</details>

<details>
<summary><strong>Searching and Filtering Pairs</strong></summary>

- Use the **search bar** at the top to filter pairs by source, target, or description
- Click **category tags** to filter by category
- Use **sorting options** to organize by name, date, or usage frequency
- View **usage count badges** to see how often each pair is used

</details>

<details>
<summary><strong>Advanced Options</strong></summary>

Click the gear icon on any pair to access:

- **Description**: Add a note about what this pair does
- **Category Tags**: Assign tags for organization
- **Case Sensitive**: Match text with exact case or ignore it
- **Whole Word Match**: Replace only complete words, not parts
- **Regex Mode**: Enable regular expression matching (v1.3)
- **Context Matching**: Control where the pair applies (v1.3)

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
- Regex pairs show a `[Rx]` badge in suggestions
- Updates in real-time as you type

</details>

<details>
<summary><strong>Configuring Suggester Settings</strong></summary>

Go to `Settings > EZ Replace > Auto-complete suggester` section:

| Setting | Description |
|---------|-------------|
| **Enable auto-complete** | Toggle the suggester on/off |
| **Minimum characters** | Characters needed before suggestions appear (1-5) |
| **Maximum suggestions** | Limit how many suggestions to display (3-10) |
| **Matching mode** | Prefix matching or fuzzy matching |
| **Show descriptions** | Display description text in suggestions |
| **Case sensitive** | Match source text with exact case |
| **Confirmation keys** | Tab only, Enter only, or both |

</details>

### Backup and Restore

<details>
<summary><strong>Exporting Your Settings</strong></summary>

1. Go to `Settings > EZ Replace`
2. Find **Backup and Restore** section
3. Click **Export to JSON**
4. A file named `ez-replace-backup-YYYYMMDD-HHMM.json` will be downloaded

</details>

<details>
<summary><strong>Importing Settings</strong></summary>

1. Click **Import from JSON**
2. Select your backup file
3. Choose import mode:
   - **Replace**: Remove all current pairs and use imported ones
   - **Merge**: Keep current pairs and add imported ones
4. Confirm your choice

</details>

---

## Regex Support

Version 1.3 introduces powerful regular expression support for advanced text transformations.

### Enabling Regex Mode

1. Open the settings for any replacement pair
2. Enable the **Regex Mode** toggle
3. Enter your regex pattern in the source field
4. Use capture group references in the target field

### Capture Groups

Use `$0` through `$9` in your target text to reference captured groups:

| Reference | Description |
|-----------|-------------|
| `$0` | The entire matched text |
| `$1` - `$9` | Captured groups in order |
| `\$` | Literal dollar sign |

### Example: Date Format Conversion

| Field | Value |
|-------|-------|
| Source | `(\d{4})-(\d{2})-(\d{2})` |
| Target | `$3/$2/$1` |
| Input | `2024-12-30` |
| Output | `30/12/2024` |

### Regex Flags

| Flag | Name | Description |
|------|------|-------------|
| `i` | Case-insensitive | Match regardless of case |
| `m` | Multiline | `^` and `$` match line boundaries |
| `s` | Dotall | `.` matches newlines |
| `u` | Unicode | Enable Unicode matching |

### Regex Template Library

Access 18 pre-built regex templates through the **Browse Templates** button:

| Category | Templates |
|----------|-----------|
| **Date** | ISO to various formats, date reordering |
| **Phone** | US, international, formatting patterns |
| **URL** | Protocol removal, domain extraction |
| **Number** | Thousand separators, decimal conversion |
| **Text** | Whitespace cleanup, quote conversion |

### Context-Aware Matching

Control where your regex pairs apply:

| Context | Description |
|---------|-------------|
| `normal` | Regular paragraph text |
| `codeBlock` | Fenced code blocks |
| `inlineCode` | Inline code spans |
| `heading` | Headings (# to ######) |
| `link` | Markdown links |
| `quote` | Block quotes |
| `list` | List items |

Set **Include** contexts to limit matching, or **Exclude** contexts to prevent matching in specific areas.

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

Import `example-pairs.json` for additional useful pairs:

| Source | Target | Description |
|--------|--------|-------------|
| `>=` | `≥` | Greater than or equal |
| `<=` | `≤` | Less than or equal |
| `alpha` | `α` | Greek letter alpha |
| `beta` | `β` | Greek letter beta |
| `infinity` | `∞` | Infinity symbol |
| `(c)` | `©` | Copyright symbol |

---

## JSON File Format

When you export settings, the file structure includes all pair properties:

```json
[
  {
    "id": "unique-identifier",
    "source": "->",
    "target": "→",
    "enabled": true,
    "description": "Right arrow",
    "caseSensitive": true,
    "wholeWord": false,
    "tags": ["arrows", "symbols"],
    "usageCount": 42,
    "lastUsed": 1735500000000,
    "isRegex": false,
    "regexFlags": "",
    "matchContext": {
      "include": [],
      "exclude": ["codeBlock", "inlineCode"]
    }
  }
]
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `source` | string | Text or regex pattern to match |
| `target` | string | Replacement text (supports $1-$9 for regex) |
| `enabled` | boolean | Whether the pair is active |
| `description` | string | Optional description |
| `caseSensitive` | boolean | Case-sensitive matching |
| `wholeWord` | boolean | Match whole words only |
| `tags` | string[] | Category tags (v1.2) |
| `usageCount` | number | Times used (v1.2) |
| `lastUsed` | number | Last use timestamp (v1.2) |
| `isRegex` | boolean | Enable regex mode (v1.3) |
| `regexFlags` | string | Regex flags: i, m, s, u (v1.3) |
| `matchContext` | object | Context filtering (v1.3) |

---

## Commands

The plugin registers these commands in the Command Palette (`Ctrl+P`):

| Command | Description |
|---------|-------------|
| `Replace selected text` | Replace the selected text with matching pair |
| `Open settings` | Quickly open plugin settings |

**Note**: EZ Replace does not set a default hotkey. Configure your preferred shortcut in Settings > Hotkeys.

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
│   ├── main.ts            # Plugin entry point and core logic
│   ├── settingsTab.ts     # Settings UI and modals
│   ├── settings.ts        # Default settings
│   ├── suggester.ts       # Auto-complete suggester
│   ├── regexTemplates.ts  # Pre-built regex templates
│   └── types.ts           # TypeScript type definitions
├── styles.css             # Plugin styles
├── manifest.json          # Plugin metadata
├── example-pairs.json     # Example configurations
└── README.md              # Documentation
```

---

## Troubleshooting

<details>
<summary><strong>Replacement not working</strong></summary>

- Check if the pair is enabled (toggle should be ON)
- Verify exact text match (check case sensitivity setting)
- Ensure text is selected before pressing hotkey
- Check if another plugin is using the same hotkey
- For regex pairs, verify the pattern is valid (check validation indicator)

</details>

<details>
<summary><strong>Regex not matching</strong></summary>

- Ensure **Regex Mode** is enabled for the pair
- Check the validation indicator for syntax errors
- Verify your pattern matches the entire selected text
- Test your regex pattern with the preview feature in settings
- Check if context filtering is excluding your current location

</details>

<details>
<summary><strong>Capture groups not working</strong></summary>

- Use `$1`, `$2`, etc. (not `\1`, `\2`)
- Ensure your pattern has capturing groups: `(\d+)` not `\d+`
- Check that group numbers match your pattern's group count
- Use `$0` for the full match

</details>

<details>
<summary><strong>Import failed</strong></summary>

- Verify JSON file format is correct
- Check that each pair has `source` and `target` fields
- Try a fresh export to ensure valid format
- Validate JSON syntax with an online validator

</details>

<details>
<summary><strong>Hotkey not working</strong></summary>

- Check for conflicts in `Settings > Hotkeys`
- Try setting a different key combination
- Restart Obsidian after changing hotkeys

</details>

---

## Version History

### v1.3.0 (2025-12-30)

**Regex and Context-Aware Matching Release**

- Regular expression support with per-pair toggle
- Capture groups ($0-$9) for advanced replacements
- Regex flags: case-insensitive, multiline, dotall, unicode
- Real-time regex validation with error display
- Regex test preview in settings
- 18 pre-built regex templates across 5 categories
- Template browser modal with category filtering
- Context-aware matching (code blocks, headings, links, etc.)
- Include/exclude context filters per pair

### v1.2.0 (2025-12-15)

**Search, Categories, and Statistics Release**

- Search bar for filtering replacement pairs
- Category/tag system with multi-tag support
- Sorting options (name, date, usage frequency)
- Usage statistics tracking per pair
- Statistics dashboard with top pairs view
- Export statistics to JSON
- Usage count badges in pair list

### v1.1.0 (2025-11-13)

**Auto-Complete Suggester Release**

- Auto-complete suggester with real-time suggestions
- Prefix and fuzzy matching algorithms
- Customizable suggester settings (7 options)
- Tab and Enter key support for accepting suggestions
- Smart suggestion rendering with descriptions

### v1.0.0 (2025-11-12)

**Initial Release**

- Text replacement with customizable hotkey
- Replacement pairs management (Add, Edit, Delete, Reorder)
- Enable/disable individual pairs
- Advanced options (Case-sensitive, Whole word, Description)
- JSON Export/Import (Replace and Merge modes)
- Hotkey configuration UI

---

## Contributing

Contributions are welcome. Please feel free to:

- Report bugs or suggest features via GitHub Issues
- Submit pull requests for improvements
- Share your replacement pair collections
- Translate documentation to other languages

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

If you find this plugin helpful, consider:

- Starring the repository on GitHub
- Sharing it with other Obsidian users
- Contributing to the project

---

<div align="center">

Made for the Obsidian community

[Report Bug](https://github.com/AR0NICA/ez-replace/issues) | [Request Feature](https://github.com/AR0NICA/ez-replace/issues)

</div>
