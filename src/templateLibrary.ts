import { Template, TemplateCategory } from './types';

/**
 * Pre-built template library (v1.4.0)
 * Contains common templates for various use cases
 */
export const TEMPLATE_LIBRARY: Template[] = [
	// Meeting Notes Templates
	{
		id: 'meeting-notes-1',
		name: 'Meeting Notes Header',
		category: 'meeting-notes',
		source: 'meeting',
		target: '# Meeting Notes - {{date}}\n\nAttendees: {{cursor}}\nDate: {{date}}\nTime: {{time}}\n\n## Agenda\n\n## Discussion\n\n## Action Items\n',
		description: 'Create structured meeting notes with date and time',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'Month DD, YYYY' },
			{ name: 'time', type: 'time', timeFormat: '12h' }
		],
		cursorPosition: 30,
		example: {
			input: 'meeting',
			output: '# Meeting Notes - January 26, 2026\n\nAttendees: [cursor]\nDate: January 26, 2026\nTime: 2:30 PM'
		}
	},
	{
		id: 'meeting-notes-2',
		name: 'Quick Meeting Note',
		category: 'meeting-notes',
		source: 'qmeet',
		target: '**Meeting** ({{date}} {{time}}): {{cursor}}',
		description: 'Quick inline meeting note with timestamp',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' },
			{ name: 'time', type: 'time', timeFormat: 'HH:MM' }
		],
		cursorPosition: 35,
		example: {
			input: 'qmeet',
			output: '**Meeting** (2026-01-26 14:30): [cursor]'
		}
	},

	// TODO Templates
	{
		id: 'todo-1',
		name: 'TODO with Date',
		category: 'todo',
		source: 'td',
		target: '- [ ] {{cursor}} (due: {{date}})',
		description: 'Create TODO item with due date',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' }
		],
		cursorPosition: 6,
		example: {
			input: 'td',
			output: '- [ ] [cursor] (due: 2026-01-26)'
		}
	},
	{
		id: 'todo-2',
		name: 'Priority TODO',
		category: 'todo',
		source: 'tdp',
		target: '- [ ] [P1] {{cursor}} - {{date}}',
		description: 'High priority TODO item',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'DD/MM/YYYY' }
		],
		cursorPosition: 11,
		example: {
			input: 'tdp',
			output: '- [ ] [P1] [cursor] - 26/01/2026'
		}
	},
	{
		id: 'todo-3',
		name: 'Delegated Task',
		category: 'todo',
		source: 'tdd',
		target: '- [ ] @{{cursor}} - {{selection}} (assigned: {{date}})',
		description: 'Task delegated to someone with original selection',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' },
			{ name: 'selection', type: 'selection' }
		],
		cursorPosition: 8,
		example: {
			input: 'tdd',
			output: '- [ ] @[cursor] - selected_text (assigned: 2026-01-26)'
		}
	},

	// Code Block Templates
	{
		id: 'code-block-1',
		name: 'Code Block with Title',
		category: 'code-block',
		source: 'codeblock',
		target: '```{{cursor}}\n{{clipboard}}\n```',
		description: 'Create code block with clipboard content',
		variables: [
			{ name: 'clipboard', type: 'clipboard' }
		],
		cursorPosition: 3,
		example: {
			input: 'codeblock',
			output: '```[cursor]\nclipboard_content\n```'
		}
	},
	{
		id: 'code-block-2',
		name: 'Timestamped Code Snippet',
		category: 'code-block',
		source: 'tscode',
		target: '> Code snippet ({{date}} {{time}})\n\n```typescript\n{{cursor}}\n```',
		description: 'TypeScript code block with timestamp',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' },
			{ name: 'time', type: 'time', timeFormat: 'HH:MM:SS' }
		],
		cursorPosition: 50,
		example: {
			input: 'tscode',
			output: '> Code snippet (2026-01-26 14:30:45)\n\n```typescript\n[cursor]\n```'
		}
	},

	// Citation Templates
	{
		id: 'citation-1',
		name: 'Basic Citation',
		category: 'citation',
		source: 'cite',
		target: '> {{selection}}\n> \n> — {{cursor}}, {{date}}',
		description: 'Quote with author and date',
		variables: [
			{ name: 'selection', type: 'selection' },
			{ name: 'date', type: 'date', dateFormat: 'Month DD, YYYY' }
		],
		cursorPosition: 20,
		example: {
			input: 'cite',
			output: '> selected_text\n> \n> — [cursor], January 26, 2026'
		}
	},
	{
		id: 'citation-2',
		name: 'Academic Citation',
		category: 'citation',
		source: 'acite',
		target: '{{selection}} [^{{cursor}}]\n\n[^{{cursor}}]: Source: , Accessed: {{date}}',
		description: 'Academic-style citation with footnote',
		variables: [
			{ name: 'selection', type: 'selection' },
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' }
		],
		tabStops: [20, 35],
		example: {
			input: 'acite',
			output: 'selected_text [^1]\n\n[^1]: Source: [cursor], Accessed: 2026-01-26'
		}
	},

	// General Templates
	{
		id: 'general-1',
		name: 'Timestamp',
		category: 'general',
		source: 'ts',
		target: '{{date}} {{time}}',
		description: 'Insert current timestamp',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' },
			{ name: 'time', type: 'time', timeFormat: 'HH:MM' }
		],
		example: {
			input: 'ts',
			output: '2026-01-26 14:30'
		}
	},
	{
		id: 'general-2',
		name: 'Daily Note Header',
		category: 'general',
		source: 'daily',
		target: '# {{date}}\n\n## Tasks\n- [ ] {{cursor}}\n\n## Notes\n\n## Reflections\n',
		description: 'Daily note template structure',
		variables: [
			{ name: 'date', type: 'date', dateFormat: 'DD Month YYYY' }
		],
		cursorPosition: 30,
		example: {
			input: 'daily',
			output: '# 26 January 2026\n\n## Tasks\n- [ ] [cursor]\n\n## Notes\n\n## Reflections\n'
		}
	}
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
	return TEMPLATE_LIBRARY.filter(template => template.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
	return TEMPLATE_LIBRARY.find(template => template.id === id);
}

/**
 * Get all template categories
 */
export function getAllTemplateCategories(): TemplateCategory[] {
	return ['meeting-notes', 'todo', 'code-block', 'citation', 'general'];
}
