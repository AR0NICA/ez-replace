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
	// v1.2.0: Category/Tag system
	tags?: string[];
	// v1.2.0: Usage statistics
	createdAt?: number;
	usageCount?: number;
	lastUsedAt?: number;
	// v1.3.0: Regex support
	isRegex?: boolean;
	regexFlags?: string;
	// v1.3.0: Context-aware matching
	matchContext?: MatchContext;
}

/**
 * Context types for context-aware matching (v1.3.0)
 */
export type ContextType = 'codeBlock' | 'inlineCode' | 'heading' | 'link' | 'quote' | 'list' | 'normal';

/**
 * Context matching settings for advanced matching (v1.3.0)
 */
export interface MatchContext {
	include?: ContextType[];
	exclude?: ContextType[];
}

/**
 * Result of regex validation (v1.3.0)
 */
export interface RegexValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Regex template category (v1.3.0)
 */
export type RegexTemplateCategory = 'date' | 'phone' | 'url' | 'case' | 'number' | 'text' | 'custom';

/**
 * Regex template for pre-built patterns (v1.3.0)
 */
export interface RegexTemplate {
	id: string;
	name: string;
	category: RegexTemplateCategory;
	source: string;
	target: string;
	flags?: string;
	description: string;
	example: {
		input: string;
		output: string;
	};
}

/**
 * Sort options for replacement pairs list
 */
export type SortField = 'name' | 'createdAt' | 'usageCount' | 'lastUsedAt';
export type SortOrder = 'asc' | 'desc';

/**
 * Search and filter settings (v1.2.0)
 */
export interface SearchFilterSettings {
	searchQuery: string;
	selectedTags: string[];
	sortField: SortField;
	sortOrder: SortOrder;
}

/**
 * Global usage statistics (v1.2.0)
 */
export interface UsageStatistics {
	totalReplacements: number;
	lastResetAt?: number;
}

/**
 * Plugin settings structure
 */
export interface EZReplaceSettings {
	replacementPairs: ReplacementPair[];
	showNotification: boolean;
	suggester: SuggesterSettings;
	// v1.2.0: Search and filter preferences
	searchFilter: SearchFilterSettings;
	// v1.2.0: Global usage statistics
	statistics: UsageStatistics;
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
