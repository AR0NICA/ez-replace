import { ReplacementPair, TemplateValidationResult } from './types';

/**
 * Validation utilities for template system (v1.4.0)
 */

/**
 * Validate that regex and template modes are not both enabled
 */
export function validatePairModes(pair: ReplacementPair): { valid: boolean; error?: string } {
	if (pair.isRegex && pair.isTemplate) {
		return {
			valid: false,
			error: 'Cannot enable both Regex and Template modes simultaneously'
		};
	}
	return { valid: true };
}

/**
 * Validate template syntax and variables
 */
export function validateTemplatePair(pair: ReplacementPair): TemplateValidationResult {
	if (!pair.isTemplate) {
		return { valid: true };
	}

	const warnings: string[] = [];

	// Check for empty target
	if (!pair.target || pair.target.trim() === '') {
		return {
			valid: false,
			error: 'Template target cannot be empty'
		};
	}

	// Check for unmatched braces
	const openBraces = (pair.target.match(/\{\{/g) || []).length;
	const closeBraces = (pair.target.match(/\}\}/g) || []).length;
	
	if (openBraces !== closeBraces) {
		return {
			valid: false,
			error: 'Unmatched braces in template'
		};
	}

	// Extract variable names
	const variableRegex = /\{\{([^}]+)\}\}/g;
	const matches = Array.from(pair.target.matchAll(variableRegex));
	const usedVars = new Set<string>();
	
	for (const match of matches) {
		usedVars.add(match[1]);
	}

	// Check for undefined variables (except built-in and tabstops)
	const builtInVars = new Set(['date', 'time', 'selection', 'clipboard', 'cursor']);
	const definedVars = new Set((pair.templateVariables || []).map(v => v.name));
	
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
	const cursorCount = (pair.target.match(/\{\{cursor\}\}/g) || []).length;
	if (cursorCount > 1) {
		warnings.push('Multiple cursor markers found, only first will be used');
	}

	return {
		valid: true,
		warnings: warnings.length > 0 ? warnings : undefined
	};
}

/**
 * Check if a pair has any validation warnings or errors
 */
export function getPairValidationStatus(pair: ReplacementPair): 'valid' | 'warning' | 'error' {
	// Check mode conflict
	const modeValidation = validatePairModes(pair);
	if (!modeValidation.valid) {
		return 'error';
	}

	// Check template validation
	if (pair.isTemplate) {
		const templateValidation = validateTemplatePair(pair);
		if (!templateValidation.valid) {
			return 'error';
		}
		if (templateValidation.warnings && templateValidation.warnings.length > 0) {
			return 'warning';
		}
	}

	return 'valid';
}
