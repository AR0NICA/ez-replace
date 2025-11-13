/**
 * Type definitions for EZ Replace plugin
 */

/**
 * Represents a single replacement pair
 */
export interface ReplacementPair {
	id: string;
	source: string;
	target: string;
	enabled: boolean;
	description?: string;
	caseSensitive?: boolean;
	wholeWord?: boolean;
}

/**
 * Plugin settings structure
 */
export interface EZReplaceSettings {
	replacementPairs: ReplacementPair[];
	showNotification: boolean;
	suggester: SuggesterSettings;
}

/**
 * Auto-complete suggester settings
 */
export interface SuggesterSettings {
	enabled: boolean;
	minCharacters: number;
	maxSuggestions: number;
	matchingMode: 'prefix' | 'fuzzy';
	showDescription: boolean;
	caseSensitive: boolean;
	acceptKeys: 'tab' | 'enter' | 'both';
}
