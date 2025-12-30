/**
 * Pre-built regex templates for common use cases (v1.3.0)
 */

import { RegexTemplate, RegexTemplateCategory } from './types';

/**
 * Category display names
 */
export const TEMPLATE_CATEGORY_NAMES: Record<RegexTemplateCategory, string> = {
	date: 'Date Formats',
	phone: 'Phone Numbers',
	url: 'URLs & Links',
	case: 'Case Transformations',
	number: 'Number Formats',
	text: 'Text Patterns',
	custom: 'Custom'
};

/**
 * Pre-built regex templates
 */
export const REGEX_TEMPLATES: RegexTemplate[] = [
	// Date Format Templates
	{
		id: 'date-iso-to-us',
		name: 'ISO to US Date',
		category: 'date',
		source: '(\\d{4})-(\\d{2})-(\\d{2})',
		target: '$2/$3/$1',
		description: 'Convert YYYY-MM-DD to MM/DD/YYYY',
		example: {
			input: '2024-12-30',
			output: '12/30/2024'
		}
	},
	{
		id: 'date-iso-to-eu',
		name: 'ISO to EU Date',
		category: 'date',
		source: '(\\d{4})-(\\d{2})-(\\d{2})',
		target: '$3/$2/$1',
		description: 'Convert YYYY-MM-DD to DD/MM/YYYY',
		example: {
			input: '2024-12-30',
			output: '30/12/2024'
		}
	},
	{
		id: 'date-us-to-iso',
		name: 'US to ISO Date',
		category: 'date',
		source: '(\\d{2})/(\\d{2})/(\\d{4})',
		target: '$3-$1-$2',
		description: 'Convert MM/DD/YYYY to YYYY-MM-DD',
		example: {
			input: '12/30/2024',
			output: '2024-12-30'
		}
	},
	{
		id: 'date-dot-to-iso',
		name: 'Dot to ISO Date',
		category: 'date',
		source: '(\\d{2})\\.(\\d{2})\\.(\\d{4})',
		target: '$3-$2-$1',
		description: 'Convert DD.MM.YYYY to YYYY-MM-DD',
		example: {
			input: '30.12.2024',
			output: '2024-12-30'
		}
	},

	// Phone Number Templates
	{
		id: 'phone-kr-format',
		name: 'Korean Phone Format',
		category: 'phone',
		source: '(\\d{3})(\\d{4})(\\d{4})',
		target: '$1-$2-$3',
		description: 'Format 11-digit number as XXX-XXXX-XXXX',
		example: {
			input: '01012345678',
			output: '010-1234-5678'
		}
	},
	{
		id: 'phone-us-format',
		name: 'US Phone Format',
		category: 'phone',
		source: '(\\d{3})(\\d{3})(\\d{4})',
		target: '($1) $2-$3',
		description: 'Format 10-digit number as (XXX) XXX-XXXX',
		example: {
			input: '1234567890',
			output: '(123) 456-7890'
		}
	},
	{
		id: 'phone-intl-format',
		name: 'International Format',
		category: 'phone',
		source: '\\+(\\d{1,3})(\\d{2,3})(\\d{3,4})(\\d{4})',
		target: '+$1 $2 $3 $4',
		description: 'Format international number with spaces',
		example: {
			input: '+821012345678',
			output: '+82 10 1234 5678'
		}
	},

	// URL Templates
	{
		id: 'url-extract-domain',
		name: 'Extract Domain',
		category: 'url',
		source: 'https?://(?:www\\.)?([^/]+).*',
		target: '$1',
		description: 'Extract domain from URL',
		example: {
			input: 'https://www.example.com/path',
			output: 'example.com'
		}
	},
	{
		id: 'url-http-to-https',
		name: 'HTTP to HTTPS',
		category: 'url',
		source: 'http://(.+)',
		target: 'https://$1',
		description: 'Convert HTTP URL to HTTPS',
		example: {
			input: 'http://example.com',
			output: 'https://example.com'
		}
	},
	{
		id: 'url-markdown-link',
		name: 'URL to Markdown Link',
		category: 'url',
		source: '(https?://[^\\s]+)',
		target: '[$1]($1)',
		description: 'Convert plain URL to Markdown link',
		example: {
			input: 'https://example.com',
			output: '[https://example.com](https://example.com)'
		}
	},

	// Number Format Templates
	{
		id: 'number-thousands-comma',
		name: 'Add Thousand Separators',
		category: 'number',
		source: '(\\d)(\\d{3})(?!\\d)',
		target: '$1,$2',
		description: 'Add comma as thousand separator (apply multiple times)',
		example: {
			input: '1234567',
			output: '1,234567'
		}
	},
	{
		id: 'number-currency-krw',
		name: 'Korean Won Format',
		category: 'number',
		source: '(\\d+)',
		target: '$1won',
		flags: '',
		description: 'Append Korean Won symbol',
		example: {
			input: '10000',
			output: '10000won'
		}
	},
	{
		id: 'number-percent',
		name: 'Decimal to Percent',
		category: 'number',
		source: '0\\.(\\d{2})',
		target: '$1%',
		description: 'Convert decimal (0.XX) to percentage',
		example: {
			input: '0.75',
			output: '75%'
		}
	},

	// Text Pattern Templates
	{
		id: 'text-trim-spaces',
		name: 'Trim Multiple Spaces',
		category: 'text',
		source: '  +',
		target: ' ',
		flags: 'g',
		description: 'Replace multiple spaces with single space',
		example: {
			input: 'hello    world',
			output: 'hello world'
		}
	},
	{
		id: 'text-email-mask',
		name: 'Mask Email',
		category: 'text',
		source: '(\\w{2})\\w+@(\\w+\\.\\w+)',
		target: '$1***@$2',
		description: 'Mask email address for privacy',
		example: {
			input: 'john@example.com',
			output: 'jo***@example.com'
		}
	},
	{
		id: 'text-camel-to-snake',
		name: 'CamelCase to snake_case',
		category: 'text',
		source: '([a-z])([A-Z])',
		target: '$1_$2',
		flags: 'g',
		description: 'Convert camelCase to snake_case (lowercase separately)',
		example: {
			input: 'camelCase',
			output: 'camel_Case'
		}
	},
	{
		id: 'text-snake-to-camel',
		name: 'snake_case to CamelCase',
		category: 'text',
		source: '_([a-z])',
		target: '$1',
		flags: 'gi',
		description: 'Convert snake_case to camelCase (first letter needs manual fix)',
		example: {
			input: 'snake_case',
			output: 'snakecase'
		}
	},
	{
		id: 'text-wrap-quotes',
		name: 'Wrap in Quotes',
		category: 'text',
		source: '(.+)',
		target: '"$1"',
		description: 'Wrap text in double quotes',
		example: {
			input: 'hello world',
			output: '"hello world"'
		}
	},
	{
		id: 'text-wrap-parens',
		name: 'Wrap in Parentheses',
		category: 'text',
		source: '(.+)',
		target: '($1)',
		description: 'Wrap text in parentheses',
		example: {
			input: 'note',
			output: '(note)'
		}
	},
	{
		id: 'text-wrap-brackets',
		name: 'Wrap in Brackets',
		category: 'text',
		source: '(.+)',
		target: '[$1]',
		description: 'Wrap text in square brackets',
		example: {
			input: 'reference',
			output: '[reference]'
		}
	},
	{
		id: 'text-remove-html-tags',
		name: 'Remove HTML Tags',
		category: 'text',
		source: '<[^>]+>',
		target: '',
		flags: 'g',
		description: 'Strip HTML tags from text',
		example: {
			input: '<p>Hello</p>',
			output: 'Hello'
		}
	}
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: RegexTemplateCategory): RegexTemplate[] {
	return REGEX_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all available categories with their templates
 */
export function getTemplateCategories(): { category: RegexTemplateCategory; name: string; count: number }[] {
	const categories: RegexTemplateCategory[] = ['date', 'phone', 'url', 'number', 'text'];
	
	return categories.map(category => ({
		category,
		name: TEMPLATE_CATEGORY_NAMES[category],
		count: getTemplatesByCategory(category).length
	}));
}

/**
 * Find template by ID
 */
export function getTemplateById(id: string): RegexTemplate | undefined {
	return REGEX_TEMPLATES.find(t => t.id === id);
}
