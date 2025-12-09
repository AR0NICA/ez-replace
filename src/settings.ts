import { EZReplaceSettings, SearchFilterSettings, UsageStatistics } from './types';

/**
 * Default search/filter settings (v1.2.0)
 */
export const DEFAULT_SEARCH_FILTER: SearchFilterSettings = {
	searchQuery: '',
	selectedTags: [],
	sortField: 'name',
	sortOrder: 'asc'
};

/**
 * Default usage statistics (v1.2.0)
 */
export const DEFAULT_STATISTICS: UsageStatistics = {
	totalReplacements: 0,
	lastResetAt: undefined
};

/**
 * Default settings for the plugin
 */
export const DEFAULT_SETTINGS: EZReplaceSettings = {
	replacementPairs: [
		{
			id: 'default-1',
			source: '->',
			target: '→',
			enabled: true,
			description: 'Right arrow',
			caseSensitive: true,
			wholeWord: false,
			tags: ['arrows'],
			createdAt: Date.now(),
			usageCount: 0,
			lastUsedAt: undefined
		},
		{
			id: 'default-2',
			source: '<-',
			target: '←',
			enabled: true,
			description: 'Left arrow',
			caseSensitive: true,
			wholeWord: false,
			tags: ['arrows'],
			createdAt: Date.now(),
			usageCount: 0,
			lastUsedAt: undefined
		},
		{
			id: 'default-3',
			source: '=>',
			target: '⇒',
			enabled: true,
			description: 'Double right arrow',
			caseSensitive: true,
			wholeWord: false,
			tags: ['arrows'],
			createdAt: Date.now(),
			usageCount: 0,
			lastUsedAt: undefined
		},
		{
			id: 'default-4',
			source: '!=',
			target: '≠',
			enabled: true,
			description: 'Not equal',
			caseSensitive: true,
			wholeWord: false,
			tags: ['math'],
			createdAt: Date.now(),
			usageCount: 0,
			lastUsedAt: undefined
		}
	],
	showNotification: true,
	suggester: {
		enabled: true,
		minCharacters: 2,
		maxSuggestions: 5,
		matchingMode: 'prefix',
		showDescription: true,
		caseSensitive: false,
		acceptKeys: 'both'
	},
	searchFilter: DEFAULT_SEARCH_FILTER,
	statistics: DEFAULT_STATISTICS
};
