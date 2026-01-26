import { TemplateVariable, TemplateValidationResult, DateFormat, TimeFormat } from './types';

/**
 * Template processing engine (v1.4.0)
 * Handles variable resolution, cursor positioning, and template validation
 */
export class TemplateProcessor {
	private static readonly VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;
	private static readonly CURSOR_MARKER = '{{cursor}}';
	private static readonly TABSTOP_REGEX = /\{\{tab(\d+)\}\}/g;

	/**
	 * Process template with variable substitution
	 * @param template Template string with variable markers
	 * @param variables Array of template variables
	 * @param selectedText Original selected text for {{selection}} variable
	 * @returns Processed template string
	 */
	async process(
		template: string,
		variables: TemplateVariable[],
		selectedText?: string
	): Promise<string> {
		let result = template;
		const processedVars = new Set<string>();

		// Create a map of variable names to their definitions
		const variableMap = new Map<string, TemplateVariable>();
		for (const variable of variables) {
			variableMap.set(variable.name, variable);
		}

		// Process all variable markers
		const matches = Array.from(template.matchAll(TemplateProcessor.VARIABLE_REGEX));
		
		for (const match of matches) {
			const varName = match[1];
			
			// Skip if already processed (avoid infinite loops)
			if (processedVars.has(varName)) {
				continue;
			}

			const variable = variableMap.get(varName);
			let value = '';

			if (variable) {
				value = await this.resolveVariable(variable, selectedText);
			} else {
				// Handle built-in variables without explicit definition
				value = await this.resolveBuiltInVariable(varName, selectedText);
			}

			// Replace all occurrences of this variable
			const varPattern = new RegExp(`\\{\\{${this.escapeRegex(varName)}\\}\\}`, 'g');
			result = result.replace(varPattern, value);
			processedVars.add(varName);
		}

		return result;
	}

	/**
	 * Resolve a template variable to its value
	 */
	private async resolveVariable(
		variable: TemplateVariable,
		selectedText?: string
	): Promise<string> {
		switch (variable.type) {
			case 'date':
				return this.formatDate(new Date(), variable.dateFormat || 'YYYY-MM-DD');
			
			case 'time':
				return this.formatTime(new Date(), variable.timeFormat || '24h');
			
			case 'selection':
				return selectedText || '';
			
			case 'clipboard':
				return await this.getClipboardContent();
			
			case 'custom':
				return variable.defaultValue || '';
			
			default:
				return '';
		}
	}

	/**
	 * Resolve built-in variables without explicit definition
	 */
	private async resolveBuiltInVariable(
		varName: string,
		selectedText?: string
	): Promise<string> {
		switch (varName) {
			case 'date':
				return this.formatDate(new Date(), 'YYYY-MM-DD');
			
			case 'time':
				return this.formatTime(new Date(), '24h');
			
			case 'selection':
				return selectedText || '';
			
			case 'clipboard':
				return await this.getClipboardContent();
			
			case 'cursor':
				// Cursor marker is handled separately, don't replace
				return '{{cursor}}';
			
			default:
				// Check for tabstop markers (tab1, tab2, etc.)
				if (varName.startsWith('tab')) {
					return `{{${varName}}}`;
				}
				// Unknown variable: return empty or keep original
				return '';
		}
	}

	/**
	 * Format date according to specified format
	 */
	private formatDate(date: Date, format: DateFormat): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		
		const monthNames = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];
		const monthName = monthNames[date.getMonth()];

		switch (format) {
			case 'YYYY-MM-DD':
				return `${year}-${month}-${day}`;
			
			case 'DD/MM/YYYY':
				return `${day}/${month}/${year}`;
			
			case 'MM/DD/YYYY':
				return `${month}/${day}/${year}`;
			
			case 'YYYY/MM/DD':
				return `${year}/${month}/${day}`;
			
			case 'DD-MM-YYYY':
				return `${day}-${month}-${year}`;
			
			case 'Month DD, YYYY':
				return `${monthName} ${day}, ${year}`;
			
			case 'DD Month YYYY':
				return `${day} ${monthName} ${year}`;
			
			default:
				return `${year}-${month}-${day}`;
		}
	}

	/**
	 * Format time according to specified format
	 */
	private formatTime(date: Date, format: TimeFormat): string {
		const hours24 = date.getHours();
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		switch (format) {
			case '24h':
			case 'HH:MM':
				return `${String(hours24).padStart(2, '0')}:${minutes}`;
			
			case 'HH:MM:SS':
				return `${String(hours24).padStart(2, '0')}:${minutes}:${seconds}`;
			
			case '12h': {
				const hours12 = hours24 % 12 || 12;
				const ampm = hours24 < 12 ? 'AM' : 'PM';
				return `${hours12}:${minutes} ${ampm}`;
			}
			
			default:
				return `${String(hours24).padStart(2, '0')}:${minutes}`;
		}
	}

	/**
	 * Get clipboard content with fallback
	 */
	private async getClipboardContent(): Promise<string> {
		try {
			// Try to read from clipboard
			const clipboardText = await navigator.clipboard.readText();
			return this.sanitizeValue(clipboardText);
		} catch (error) {
			// Clipboard access denied or not available
			return '';
		}
	}

	/**
	 * Sanitize variable values to prevent injection
	 */
	private sanitizeValue(value: string): string {
		// Remove any potentially dangerous characters
		// Keep alphanumeric, spaces, basic punctuation, and newlines
		return value.replace(/[^\w\s.,!?;:()\-\n\r\t'"]/g, '');
	}

	/**
	 * Calculate cursor position after template expansion
	 * @param processedTemplate Template string after variable substitution
	 * @returns Cursor offset from start, or -1 if no cursor marker
	 */
	calculateCursorPosition(processedTemplate: string): number {
		const cursorIndex = processedTemplate.indexOf(TemplateProcessor.CURSOR_MARKER);
		return cursorIndex;
	}

	/**
	 * Remove cursor marker from template
	 */
	removeCursorMarker(template: string): string {
		return template.replace(TemplateProcessor.CURSOR_MARKER, '');
	}

	/**
	 * Extract tabstop positions from template
	 * @param processedTemplate Template string after variable substitution
	 * @returns Array of tabstop positions [position, tabNumber]
	 */
	extractTabStops(processedTemplate: string): Array<{ position: number; tabNumber: number }> {
		const tabStops: Array<{ position: number; tabNumber: number }> = [];
		const matches = Array.from(processedTemplate.matchAll(TemplateProcessor.TABSTOP_REGEX));
		
		for (const match of matches) {
			const tabNumber = parseInt(match[1], 10);
			const position = match.index || 0;
			tabStops.push({ position, tabNumber });
		}

		// Sort by tab number
		tabStops.sort((a, b) => a.tabNumber - b.tabNumber);
		return tabStops;
	}

	/**
	 * Remove all tabstop markers from template
	 */
	removeTabStopMarkers(template: string): string {
		return template.replace(TemplateProcessor.TABSTOP_REGEX, '');
	}

	/**
	 * Validate template syntax
	 */
	validateTemplate(template: string, variables: TemplateVariable[]): TemplateValidationResult {
		const warnings: string[] = [];
		
		// Check for unmatched braces
		const openBraces = (template.match(/\{\{/g) || []).length;
		const closeBraces = (template.match(/\}\}/g) || []).length;
		
		if (openBraces !== closeBraces) {
			return {
				valid: false,
				error: 'Unmatched braces in template'
			};
		}

		// Extract all variable names from template
		const matches = Array.from(template.matchAll(TemplateProcessor.VARIABLE_REGEX));
		const usedVars = new Set<string>();
		
		for (const match of matches) {
			usedVars.add(match[1]);
		}

		// Check if all used variables are defined or built-in
		const builtInVars = new Set(['date', 'time', 'selection', 'clipboard', 'cursor']);
		const definedVars = new Set(variables.map(v => v.name));
		
		for (const varName of usedVars) {
			// Skip tabstop markers
			if (varName.startsWith('tab') && /^tab\d+$/.test(varName)) {
				continue;
			}
			
			if (!builtInVars.has(varName) && !definedVars.has(varName)) {
				warnings.push(`Variable '${varName}' is not defined`);
			}
		}

		// Check for multiple cursor markers
		const cursorCount = (template.match(/\{\{cursor\}\}/g) || []).length;
		if (cursorCount > 1) {
			warnings.push('Multiple cursor markers found, only first will be used');
		}

		return {
			valid: true,
			warnings: warnings.length > 0 ? warnings : undefined
		};
	}

	/**
	 * Escape special regex characters
	 */
	private escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}
