import { Plugin, Editor, App } from 'obsidian';
import { EZReplaceSettings, ReplacementPair, RegexValidationResult, ContextType } from './types';
import { DEFAULT_SETTINGS } from './settings';
import { EZReplaceSettingTab } from './settingsTab';
import { ReplacementSuggester } from './suggester';
import { TemplateProcessor } from './templateProcessor';
import { TemplateBrowserModal } from './templateBrowser';

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
	templateProcessor: TemplateProcessor;

	async onload() {
		// Load settings
		await this.loadSettings();

		// Initialize template processor (v1.4.0)
		this.templateProcessor = new TemplateProcessor();

		// Initialize suggester
		this.suggester = new ReplacementSuggester(this);
		this.registerEditorSuggest(this.suggester);

		// Add settings tab
		this.addSettingTab(new EZReplaceSettingTab(this.app, this));

		// Add command to replace text
		this.addCommand({
			id: 'replace-selected-text',
			name: 'Replace selected text',
			editorCallback: async (editor: Editor) => {
				await this.replaceSelectedText(editor);
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

		// Add command to open template library (v1.4.0)
		this.addCommand({
			id: 'open-template-library',
			name: 'Open template library',
			callback: () => {
				new TemplateBrowserModal(this.app, this).open();
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
	async replaceSelectedText(editor: Editor) {
		const selectedText = editor.getSelection();
		
		if (!selectedText) {
			return;
		}

		// v1.3.0: Detect current context for context-aware matching
		const cursor = editor.getCursor('from');
		const context = this.detectContext(editor, cursor.line, cursor.ch);
		
		// Find matching replacement pair and get match result
		const matchResult = this.findMatchingPairWithResult(selectedText, context);
		
		if (matchResult) {
			const { pair, match } = matchResult;
			let replacement = pair.target;
			
			// v1.4.0: Process template if enabled
			if (pair.isTemplate) {
				replacement = await this.processTemplate(pair, selectedText);
			}
			// Apply capture group substitution for regex pairs (v1.3.0)
			else if (pair.isRegex && match && Array.isArray(match)) {
				replacement = this.applyCaptureGroups(pair.target, match);
			}
			
			// Replace the selected text with target
			editor.replaceSelection(replacement);
			
			// v1.4.0: Handle cursor positioning for templates
			if (pair.isTemplate) {
				this.positionCursorAfterTemplate(editor, replacement);
			}
			
			// Update usage statistics (v1.2.0)
			await this.updateUsageStatistics(pair);
		}
	}

	/**
	 * Process template with variable substitution (v1.4.0)
	 */
	async processTemplate(pair: ReplacementPair, selectedText: string): Promise<string> {
		const variables = pair.templateVariables || [];
		
		// Process template with variables
		let processed = await this.templateProcessor.process(
			pair.target,
			variables,
			selectedText
		);
		
		// Remove cursor marker
		processed = this.templateProcessor.removeCursorMarker(processed);
		
		// Remove tabstop markers
		processed = this.templateProcessor.removeTabStopMarkers(processed);
		
		return processed;
	}

	/**
	 * Position cursor after template insertion (v1.4.0)
	 */
	positionCursorAfterTemplate(editor: Editor, processedTemplate: string): void {
		// Calculate cursor position before removing marker
		const cursorPos = this.templateProcessor.calculateCursorPosition(processedTemplate);
		
		if (cursorPos === -1) {
			// No cursor marker, position at end
			return;
		}
		
		// Get the current cursor position (end of replacement)
		const currentCursor = editor.getCursor();
		
		// Calculate the offset from the start of the replacement
		const startPos = {
			line: currentCursor.line,
			ch: currentCursor.ch - processedTemplate.length
		};
		
		// Count newlines before cursor position
		const textBeforeCursor = processedTemplate.substring(0, cursorPos);
		const lines = textBeforeCursor.split('\n');
		const lineOffset = lines.length - 1;
		const charOffset = lines[lines.length - 1].length;
		
		// Set new cursor position
		const newCursor = {
			line: startPos.line + lineOffset,
			ch: lineOffset === 0 ? startPos.ch + charOffset : charOffset
		};
		
		editor.setCursor(newCursor);
	}

	/**
	 * Update usage statistics for a replacement pair (v1.2.0)
	 */
	async updateUsageStatistics(pair: ReplacementPair): Promise<void> {
		// Update pair-level statistics
		pair.usageCount = (pair.usageCount || 0) + 1;
		pair.lastUsedAt = Date.now();
		
		// Update global statistics
		this.settings.statistics.totalReplacements = 
			(this.settings.statistics.totalReplacements || 0) + 1;
		
		await this.saveSettings();
	}

	/**
	 * Find a replacement pair that matches the given text
	 * Returns the first enabled pair with matching source
	 */
	findMatchingPair(text: string, context?: ContextType): ReplacementPair | null {
		const result = this.findMatchingPairWithResult(text, context);
		return result ? result.pair : null;
	}

	/**
	 * Find a replacement pair that matches the given text with match details (v1.3.0)
	 * Returns the pair and regex match result for capture group support
	 */
	findMatchingPairWithResult(text: string, context?: ContextType): { pair: ReplacementPair; match: RegExpMatchArray | boolean } | null {
		// Only search through enabled pairs
		const enabledPairs = this.settings.replacementPairs.filter(pair => pair.enabled);
		
		// Find matching pair considering case sensitivity, whole word, regex, and context options
		for (const pair of enabledPairs) {
			// v1.3.0: Check context filter if context is provided
			if (context && !this.isContextAllowed(pair, context)) {
				continue;
			}

			const matchResult = this.isMatch(text, pair);
			if (matchResult) {
				return { pair, match: matchResult };
			}
		}
		
		return null;
	}

	/**
	 * Check if text matches a replacement pair based on its options
	 * Returns false if no match, true for simple match, or RegExpMatchArray for regex match
	 */
	isMatch(text: string, pair: ReplacementPair): boolean | RegExpMatchArray | null {
		// v1.3.0: Handle regex matching
		if (pair.isRegex) {
			return this.regexMatch(text, pair);
		}

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
			const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(sourceToMatch)}\\b`, pair.caseSensitive ? '' : 'i');
			return wordBoundaryRegex.test(text);
		}

		// Simple exact match
		return sourceToMatch === textToMatch;
	}

	/**
	 * Match text against a regex pattern (v1.3.0)
	 * Returns RegExpMatchArray if matched, null otherwise
	 */
	regexMatch(text: string, pair: ReplacementPair): RegExpMatchArray | null {
		const validation = this.validateRegex(pair.source, pair.regexFlags);
		if (!validation.valid) {
			return null;
		}

		try {
			// Build flags: always include 'g' is not needed for match, but respect user flags
			let flags = pair.regexFlags || '';
			
			// Apply caseSensitive setting if 'i' flag not explicitly set
			if (pair.caseSensitive === false && !flags.includes('i')) {
				flags += 'i';
			}

			const regex = new RegExp(pair.source, flags);
			const match = text.match(regex);
			
			// For full text replacement, ensure the entire text matches
			if (match && match[0] === text) {
				return match;
			}
			
			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Validate a regex pattern (v1.3.0)
	 * Returns validation result with error message if invalid
	 */
	validateRegex(pattern: string, flags?: string): RegexValidationResult {
		if (!pattern) {
			return { valid: false, error: 'Pattern is empty' };
		}

		try {
			new RegExp(pattern, flags || '');
			return { valid: true };
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : 'Invalid regex pattern';
			return { valid: false, error: errorMessage };
		}
	}

	/**
	 * Apply capture groups to replacement target (v1.3.0)
	 * Supports $0 (full match), $1, $2, ... $9 capture group references
	 * Use \$ to insert a literal dollar sign
	 */
	applyCaptureGroups(target: string, match: RegExpMatchArray): string {
		let result = target;
		
		// First, protect escaped dollar signs (\$) with a placeholder
		const ESCAPED_DOLLAR_PLACEHOLDER = '\x00ESCAPED_DOLLAR\x00';
		result = result.replace(/\\\$/g, ESCAPED_DOLLAR_PLACEHOLDER);
		
		// Replace $0 with full match
		result = result.replace(/\$0/g, match[0] || '');
		
		// Replace $1 through $9 with capture groups
		for (let i = 1; i <= 9; i++) {
			const placeholder = new RegExp(`\\$${i}`, 'g');
			result = result.replace(placeholder, match[i] || '');
		}
		
		// Restore escaped dollar signs to literal $
		result = result.replace(new RegExp(ESCAPED_DOLLAR_PLACEHOLDER, 'g'), '$');
		
		return result;
	}

	/**
	 * Escape special regex characters
	 */
	escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	/**
	 * Detect the context type at a given position in the editor (v1.3.0)
	 * Returns the type of Markdown context the cursor is in
	 */
	detectContext(editor: Editor, line: number, ch: number): ContextType {
		const lineText = editor.getLine(line);
		const fullText = editor.getValue();
		const lines = fullText.split('\n');

		// Check for code block (fenced with ```)
		if (this.isInCodeBlock(lines, line)) {
			return 'codeBlock';
		}

		// Check for inline code (surrounded by backticks on same line)
		if (this.isInInlineCode(lineText, ch)) {
			return 'inlineCode';
		}

		// Check for heading (starts with #)
		if (/^#{1,6}\s/.test(lineText)) {
			return 'heading';
		}

		// Check for link (inside [...] or (...) of markdown link)
		if (this.isInLink(lineText, ch)) {
			return 'link';
		}

		// Check for blockquote (starts with >)
		if (/^>\s*/.test(lineText)) {
			return 'quote';
		}

		// Check for list item (starts with -, *, +, or number.)
		if (/^[\s]*[-*+]\s|^[\s]*\d+\.\s/.test(lineText)) {
			return 'list';
		}

		return 'normal';
	}

	/**
	 * Check if position is inside a fenced code block (v1.3.0)
	 */
	private isInCodeBlock(lines: string[], currentLine: number): boolean {
		let inCodeBlock = false;
		
		for (let i = 0; i <= currentLine; i++) {
			const line = lines[i];
			// Check for code fence (``` or ~~~)
			if (/^```|^~~~/.test(line.trim())) {
				inCodeBlock = !inCodeBlock;
			}
		}
		
		return inCodeBlock;
	}

	/**
	 * Check if position is inside inline code (v1.3.0)
	 */
	private isInInlineCode(lineText: string, ch: number): boolean {
		let inCode = false;
		let i = 0;
		
		while (i < ch && i < lineText.length) {
			if (lineText[i] === '`') {
				// Check for escaped backtick
				if (i > 0 && lineText[i - 1] === '\\') {
					i++;
					continue;
				}
				inCode = !inCode;
			}
			i++;
		}
		
		return inCode;
	}

	/**
	 * Check if position is inside a markdown link (v1.3.0)
	 */
	private isInLink(lineText: string, ch: number): boolean {
		// Simple check: look for unmatched [ or ( before position
		const beforeCursor = lineText.substring(0, ch);
		
		// Check for [text](url) pattern - inside brackets or parens
		const lastOpenBracket = beforeCursor.lastIndexOf('[');
		const lastCloseBracket = beforeCursor.lastIndexOf(']');
		const lastOpenParen = beforeCursor.lastIndexOf('(');
		const lastCloseParen = beforeCursor.lastIndexOf(')');
		
		// Inside link text [...]
		if (lastOpenBracket > lastCloseBracket) {
			return true;
		}
		
		// Inside link URL (...)
		if (lastOpenParen > lastCloseParen && lastCloseBracket !== -1 && lastOpenParen > lastCloseBracket) {
			return true;
		}
		
		return false;
	}

	/**
	 * Check if context matches the pair's context filter (v1.3.0)
	 * Returns true if the context is allowed for this pair
	 */
	isContextAllowed(pair: ReplacementPair, context: ContextType): boolean {
		const matchContext = pair.matchContext;
		
		// If no context filter defined, allow all contexts
		if (!matchContext) {
			return true;
		}

		// Check exclude list first (takes precedence)
		if (matchContext.exclude && matchContext.exclude.length > 0) {
			if (matchContext.exclude.includes(context)) {
				return false;
			}
		}

		// Check include list (if defined, only allow listed contexts)
		if (matchContext.include && matchContext.include.length > 0) {
			return matchContext.include.includes(context);
		}

		return true;
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
