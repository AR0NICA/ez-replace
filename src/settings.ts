import { EZReplaceSettings } from './types';

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
			wholeWord: false
		},
		{
			id: 'default-2',
			source: '<-',
			target: '←',
			enabled: true,
			description: 'Left arrow',
			caseSensitive: true,
			wholeWord: false
		},
		{
			id: 'default-3',
			source: '=>',
			target: '⇒',
			enabled: true,
			description: 'Double right arrow',
			caseSensitive: true,
			wholeWord: false
		},
		{
			id: 'default-4',
			source: '!=',
			target: '≠',
			enabled: true,
			description: 'Not equal',
			caseSensitive: true,
			wholeWord: false
		}
	],
	showNotification: true
};
