import { Plugin, Editor, App } from 'obsidian';
import { EZReplaceSettings, ReplacementPair } from './types';
import { DEFAULT_SETTINGS } from './settings';
import { EZReplaceSettingTab } from './settingsTab';
import { ReplacementSuggester } from './suggester';

// Extend App interface for internal API access
interface ExtendedApp extends App {
	setting: {
		open(): void;
		openTabById(id: string): void;
		close(): void;
	};
	hotkeyManager: {
		getHotkeys(commandId: string): Array<{modifiers: string[], key: string}>;
	};
}

/**
 * Main plugin class for EZ Replace
 */
export default class EZReplacePlugin extends Plugin {
	settings: EZReplaceSettings;
	suggester: ReplacementSuggester;

	async onload() {
		// Load settings
		await this.loadSettings();

		// Initialize suggester
		this.suggester = new ReplacementSuggester(this);
		this.registerEditorSuggest(this.suggester);

		// Add settings tab
		this.addSettingTab(new EZReplaceSettingTab(this.app, this));

		// Add command to replace text
		this.addCommand({
			id: 'replace-selected-text',
			name: 'Replace selected text',
			editorCallback: (editor: Editor) => {
				this.replaceSelectedText(editor);
			}
		});

		// Add command to open settings
		this.addCommand({
			id: 'open-settings',
			name: 'Open settings',
			callback: () => {
				this.openSettings();
			}
		});
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Replace selected text with matching replacement pair
	 */
	replaceSelectedText(editor: Editor) {
		const selectedText = editor.getSelection();
		
		if (!selectedText) {
			return;
		}
		
		// Find matching replacement pair
		const matchedPair = this.findMatchingPair(selectedText);
		
		if (matchedPair) {
			// Replace the selected text with target
			editor.replaceSelection(matchedPair.target);
		}
	}

	/**
	 * Find a replacement pair that matches the given text
	 * Returns the first enabled pair with matching source
	 */
	findMatchingPair(text: string) {
		// Only search through enabled pairs
		const enabledPairs = this.settings.replacementPairs.filter(pair => pair.enabled);
		
		// Find matching pair considering case sensitivity and whole word options
		for (const pair of enabledPairs) {
			if (this.isMatch(text, pair)) {
				return pair;
			}
		}
		
		return null;
	}

	/**
	 * Check if text matches a replacement pair based on its options
	 */
	isMatch(text: string, pair: ReplacementPair): boolean {
		let sourceToMatch = pair.source;
		let textToMatch = text;

		// Apply case sensitivity
		if (pair.caseSensitive === false) {
			sourceToMatch = sourceToMatch.toLowerCase();
			textToMatch = textToMatch.toLowerCase();
		}

		// Apply whole word matching
		if (pair.wholeWord === true) {
			// Check if the text is surrounded by word boundaries
			// For now, we do exact match (can be enhanced with regex)
			const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(sourceToMatch)}\\b`, pair.caseSensitive ? '' : 'i');
			return wordBoundaryRegex.test(text);
		}

		// Simple exact match
		return sourceToMatch === textToMatch;
	}

	/**
	 * Escape special regex characters
	 */
	escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	/**
	 * Open plugin settings
	 */
	openSettings(): void {
		const app = this.app as ExtendedApp;
		app.setting.open();
		app.setting.openTabById('ez-replace');
	}
}
