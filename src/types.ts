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
	// v1.4.0: Template support
	isTemplate?: boolean;
	templateVariables?: TemplateVariable[];
	cursorPosition?: number;
	tabStops?: number[];
}

/**
 * Context types for context-aware matching (v1.3.0)
 */
export type ContextType = 'codeBlock' | 'inlineCode' | 'heading' | 'link' | 'quote' | 'list' | 'normal';

/**
 * Variable types for template system (v1.4.0)
 */
export type VariableType = 'date' | 'time' | 'selection' | 'clipboard' | 'custom';

/**
 * Date format options for date variable (v1.4.0)
 */
export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'DD-MM-YYYY' | 'Month DD, YYYY' | 'DD Month YYYY';

/**
 * Time format options for time variable (v1.4.0)
 */
export type TimeFormat = '24h' | '12h' | 'HH:MM' | 'HH:MM:SS';

/**
 * Template variable definition (v1.4.0)
 */
export interface TemplateVariable {
	name: string;
	type: VariableType;
	dateFormat?: DateFormat;
	timeFormat?: TimeFormat;
	defaultValue?: string;
}

/**
 * Result of template validation (v1.4.0)
 */
export interface TemplateValidationResult {
	valid: boolean;
	error?: string;
	warnings?: string[];
}

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
 * Template library category (v1.4.0)
 */
export type TemplateCategory = 'meeting-notes' | 'todo' | 'code-block' | 'citation' | 'general';

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
 * Template library item (v1.4.0)
 */
export interface Template {
	id: string;
	name: string;
	category: TemplateCategory;
	source: string;
	target: string;
	description: string;
	variables: TemplateVariable[];
	cursorPosition?: number;
	tabStops?: number[];
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
