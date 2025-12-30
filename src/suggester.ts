import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import EZReplacePlugin from './main';
import { ReplacementPair } from './types';

/**
 * Context for suggestion matching
 */
interface SuggestionContext {
	query: string;
	start: EditorPosition;
	end: EditorPosition;
}

/**
 * Auto-complete suggester for replacement pairs
 */
export class ReplacementSuggester extends EditorSuggest<ReplacementPair> {
	plugin: EZReplacePlugin;
	private currentSuggestions: ReplacementPair[] = [];

	constructor(plugin: EZReplacePlugin) {
		super(plugin.app);
		this.plugin = plugin;
		
		// Register Tab key handler
		this.scope.register([], 'Tab', (evt: KeyboardEvent) => {
			const acceptKeys = this.plugin.settings.suggester.acceptKeys;
			// Only handle Tab if Tab is enabled
			if ((acceptKeys === 'tab' || acceptKeys === 'both') && this.currentSuggestions.length > 0) {
				const selected = this.currentSuggestions[0];
				this.selectSuggestion(selected, evt);
				return false; // Prevent default Tab behavior
			}
			return true; // Allow default Tab if disabled or no suggestions
		});

		// Register Enter key handler (override default behavior)
		this.scope.register([], 'Enter', (evt: KeyboardEvent) => {
			const acceptKeys = this.plugin.settings.suggester.acceptKeys;
			// Only handle Enter if Enter is enabled
			if ((acceptKeys === 'enter' || acceptKeys === 'both') && this.currentSuggestions.length > 0) {
				const selected = this.currentSuggestions[0];
				this.selectSuggestion(selected, evt);
				return false; // Prevent default Enter behavior
			}
			return true; // Allow default Enter if disabled or no suggestions
		});
	}

	/**
	 * Determine if suggestions should be triggered
	 */
	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		// Check if suggester is enabled
		if (!this.plugin.settings.suggester.enabled) {
			return null;
		}

		// Get current line
		const line = editor.getLine(cursor.line);
		const cursorPos = cursor.ch;

		// Find the start of current word/token
		let startPos = cursorPos;
		while (startPos > 0 && !/\s/.test(line[startPos - 1])) {
			startPos--;
		}

		// Extract the query string
		const query = line.substring(startPos, cursorPos);

		// Check minimum character requirement
		if (query.length < this.plugin.settings.suggester.minCharacters) {
			return null;
		}

		// Return trigger info
		return {
			start: { line: cursor.line, ch: startPos },
			end: cursor,
			query: query
		};
	}

	/**
	 * Get suggestions based on the query
	 */
	getSuggestions(context: EditorSuggestContext): ReplacementPair[] {
		const query = context.query;
		const settings = this.plugin.settings;

		// Get enabled replacement pairs
		const enabledPairs = settings.replacementPairs.filter(pair => pair.enabled);

		// Separate regex and non-regex pairs
		const regularPairs = enabledPairs.filter(pair => !pair.isRegex);
		const regexPairs = enabledPairs.filter(pair => pair.isRegex);

		// Match regular pairs based on selected mode
		let regularMatches: ReplacementPair[];
		if (settings.suggester.matchingMode === 'prefix') {
			regularMatches = this.prefixMatch(query, regularPairs);
		} else {
			regularMatches = this.fuzzyMatch(query, regularPairs);
		}

		// Match regex pairs (v1.3.0)
		const regexMatches = this.regexPrefixMatch(query, regexPairs);

		// Combine results: regular matches first, then regex matches
		const allMatches = [...regularMatches, ...regexMatches];

		// Limit results and store for Tab key handler
		this.currentSuggestions = allMatches.slice(0, settings.suggester.maxSuggestions);
		return this.currentSuggestions;
	}

	/**
	 * Prefix matching algorithm
	 */
	private prefixMatch(query: string, pairs: ReplacementPair[]): ReplacementPair[] {
		const caseSensitive = this.plugin.settings.suggester.caseSensitive;
		const normalizedQuery = caseSensitive ? query : query.toLowerCase();

		return pairs.filter(pair => {
			const source = caseSensitive ? pair.source : pair.source.toLowerCase();
			return source.startsWith(normalizedQuery);
		});
	}

	/**
	 * Fuzzy matching algorithm
	 */
	private fuzzyMatch(query: string, pairs: ReplacementPair[]): ReplacementPair[] {
		const caseSensitive = this.plugin.settings.suggester.caseSensitive;
		const normalizedQuery = caseSensitive ? query : query.toLowerCase();

		// Score each pair
		const scored = pairs.map(pair => {
			const source = caseSensitive ? pair.source : pair.source.toLowerCase();
			const score = this.calculateFuzzyScore(normalizedQuery, source);
			return { pair, score };
		});

		// Filter and sort by score
		return scored
			.filter(item => item.score > 0)
			.sort((a, b) => b.score - a.score)
			.map(item => item.pair);
	}

	/**
	 * Regex prefix matching algorithm (v1.3.0)
	 * Matches regex pairs where the query could potentially match the pattern
	 */
	private regexPrefixMatch(query: string, pairs: ReplacementPair[]): ReplacementPair[] {
		const matches: ReplacementPair[] = [];

		for (const pair of pairs) {
			// Validate the regex pattern first
			const validation = this.plugin.validateRegex(pair.source, pair.regexFlags);
			if (!validation.valid) {
				continue;
			}

			try {
				let flags = pair.regexFlags || '';
				if (pair.caseSensitive === false && !flags.includes('i')) {
					flags += 'i';
				}

				const regex = new RegExp(pair.source, flags);
				
				// Check if query matches the pattern (full or partial)
				// For suggester, we show if the current input matches
				if (regex.test(query)) {
					matches.push(pair);
				}
			} catch {
				// Skip invalid regex patterns
				continue;
			}
		}

		return matches;
	}

	/**
	 * Calculate fuzzy match score
	 */
	private calculateFuzzyScore(query: string, text: string): number {
		let score = 0;
		let queryIndex = 0;
		let textIndex = 0;

		while (queryIndex < query.length && textIndex < text.length) {
			if (query[queryIndex] === text[textIndex]) {
				score += 1;
				// Bonus for consecutive matches
				if (queryIndex > 0 && query[queryIndex - 1] === text[textIndex - 1]) {
					score += 2;
				}
				// Bonus for match at start
				if (textIndex === queryIndex) {
					score += 3;
				}
				queryIndex++;
			}
			textIndex++;
		}

		// Return 0 if not all query characters matched
		return queryIndex === query.length ? score : 0;
	}

	/**
	 * Render suggestion in the popup
	 */
	renderSuggestion(pair: ReplacementPair, el: HTMLElement): void {
		const container = el.createDiv({ cls: 'ez-replace-suggestion' });

		// Target text (result) - emphasized
		const target = container.createSpan({ cls: 'ez-replace-suggestion-target' });
		target.setText(pair.target);

		// v1.3.0: Regex badge
		if (pair.isRegex) {
			container.createSpan({ 
				text: 'Regex', 
				cls: 'ez-replace-suggestion-regex-badge' 
			});
		}

		// Source text (original)
		const source = container.createSpan({ cls: 'ez-replace-suggestion-source' });
		source.setText(` ${pair.source}`);

		// Description (optional)
		if (this.plugin.settings.suggester.showDescription && pair.description) {
			const desc = container.createSpan({ cls: 'ez-replace-suggestion-desc' });
			desc.setText(` - ${pair.description}`);
		}
	}

	/**
	 * Execute replacement when suggestion is selected
	 */
	selectSuggestion(pair: ReplacementPair, evt: MouseEvent | KeyboardEvent): void {
		// Check if this is an Enter key event and Enter is disabled
		const acceptKeys = this.plugin.settings.suggester.acceptKeys;
		if (evt instanceof KeyboardEvent && evt.key === 'Enter') {
			// If Enter is not allowed, don't execute
			if (acceptKeys !== 'enter' && acceptKeys !== 'both') {
				return;
			}
		}

		const editor = this.context?.editor;
		if (!editor) return;

		const start = this.context?.start;
		const end = this.context?.end;
		const query = this.context?.query;
		if (!start || !end) return;

		// Determine replacement text
		let replacement = pair.target;

		// v1.3.0: Apply capture groups for regex pairs
		if (pair.isRegex && query) {
			try {
				let flags = pair.regexFlags || '';
				if (pair.caseSensitive === false && !flags.includes('i')) {
					flags += 'i';
				}

				const regex = new RegExp(pair.source, flags);
				const match = query.match(regex);

				if (match) {
					replacement = this.plugin.applyCaptureGroups(pair.target, match);
				}
			} catch {
				// Fall back to original target on error
			}
		}

		// Replace the text
		editor.replaceRange(replacement, start, end);

		// Move cursor to end of replacement
		const newCursorPos = {
			line: start.line,
			ch: start.ch + replacement.length
		};
		editor.setCursor(newCursorPos);

		// Update usage statistics (v1.2.0)
		this.plugin.updateUsageStatistics(pair);
	}
}
