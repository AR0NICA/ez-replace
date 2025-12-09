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
