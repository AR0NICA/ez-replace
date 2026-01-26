import { TemplateProcessor } from './templateProcessor';
import { TemplateVariable } from './types';

/**
 * Test suite for TemplateProcessor (v1.4.0)
 * Run this file to verify template processing functionality
 */

async function runTests(): Promise<void> {
	const processor = new TemplateProcessor();
	let passed = 0;
	let failed = 0;

	console.log('Starting TemplateProcessor Tests...\n');

	// Test 1: Simple date variable
	try {
		const result = await processor.process('Today is {{date}}', [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' }
		]);
		const datePattern = /Today is \d{4}-\d{2}-\d{2}/;
		if (datePattern.test(result)) {
			console.log('[PASS] Test 1: Simple date variable');
			passed++;
		} else {
			console.log(`[FAIL] Test 1: Expected date pattern, got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 1: ${e}`);
		failed++;
	}

	// Test 2: Time variable with different formats
	try {
		const result = await processor.process('Time is {{time}}', [
			{ name: 'time', type: 'time', timeFormat: 'HH:MM' }
		]);
		const timePattern = /Time is \d{2}:\d{2}/;
		if (timePattern.test(result)) {
			console.log('[PASS] Test 2: Time variable (HH:MM)');
			passed++;
		} else {
			console.log(`[FAIL] Test 2: Expected time pattern, got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 2: ${e}`);
		failed++;
	}

	// Test 3: Selection variable
	try {
		const result = await processor.process('Selected: {{selection}}', [
			{ name: 'selection', type: 'selection' }
		], 'test text');
		if (result === 'Selected: test text') {
			console.log('[PASS] Test 3: Selection variable');
			passed++;
		} else {
			console.log(`[FAIL] Test 3: Expected 'Selected: test text', got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 3: ${e}`);
		failed++;
	}

	// Test 4: Custom variable with default value
	try {
		const result = await processor.process('Name: {{name}}', [
			{ name: 'name', type: 'custom', defaultValue: 'John Doe' }
		]);
		if (result === 'Name: John Doe') {
			console.log('[PASS] Test 4: Custom variable with default');
			passed++;
		} else {
			console.log(`[FAIL] Test 4: Expected 'Name: John Doe', got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 4: ${e}`);
		failed++;
	}

	// Test 5: Multiple variables
	try {
		const result = await processor.process('{{date}} at {{time}} - {{selection}}', [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' },
			{ name: 'time', type: 'time', timeFormat: 'HH:MM' },
			{ name: 'selection', type: 'selection' }
		], 'note');
		const pattern = /\d{4}-\d{2}-\d{2} at \d{2}:\d{2} - note/;
		if (pattern.test(result)) {
			console.log('[PASS] Test 5: Multiple variables');
			passed++;
		} else {
			console.log(`[FAIL] Test 5: Pattern mismatch, got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 5: ${e}`);
		failed++;
	}

	// Test 6: Cursor position calculation
	try {
		const template = 'Hello {{cursor}} world';
		const position = processor.calculateCursorPosition(template);
		if (position === 6) {
			console.log('[PASS] Test 6: Cursor position calculation');
			passed++;
		} else {
			console.log(`[FAIL] Test 6: Expected position 6, got: ${position}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 6: ${e}`);
		failed++;
	}

	// Test 7: Remove cursor marker
	try {
		const template = 'Hello {{cursor}} world';
		const result = processor.removeCursorMarker(template);
		if (result === 'Hello  world') {
			console.log('[PASS] Test 7: Remove cursor marker');
			passed++;
		} else {
			console.log(`[FAIL] Test 7: Expected 'Hello  world', got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 7: ${e}`);
		failed++;
	}

	// Test 8: Tabstop extraction
	try {
		const template = 'First {{tab1}} second {{tab2}} third';
		const tabStops = processor.extractTabStops(template);
		if (tabStops.length === 2 && tabStops[0].tabNumber === 1 && tabStops[1].tabNumber === 2) {
			console.log('[PASS] Test 8: Tabstop extraction');
			passed++;
		} else {
			console.log(`[FAIL] Test 8: Incorrect tabstops, got: ${JSON.stringify(tabStops)}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 8: ${e}`);
		failed++;
	}

	// Test 9: Remove tabstop markers
	try {
		const template = 'First {{tab1}} second {{tab2}} third';
		const result = processor.removeTabStopMarkers(template);
		if (result === 'First  second  third') {
			console.log('[PASS] Test 9: Remove tabstop markers');
			passed++;
		} else {
			console.log(`[FAIL] Test 9: Expected 'First  second  third', got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 9: ${e}`);
		failed++;
	}

	// Test 10: Template validation - valid template
	try {
		const validation = processor.validateTemplate('Hello {{date}}', [
			{ name: 'date', type: 'date' }
		]);
		if (validation.valid) {
			console.log('[PASS] Test 10: Valid template validation');
			passed++;
		} else {
			console.log(`[FAIL] Test 10: Should be valid, error: ${validation.error}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 10: ${e}`);
		failed++;
	}

	// Test 11: Template validation - unmatched braces
	try {
		const validation = processor.validateTemplate('Hello {{date}', []);
		if (!validation.valid && validation.error) {
			console.log('[PASS] Test 11: Invalid template detection (unmatched braces)');
			passed++;
		} else {
			console.log(`[FAIL] Test 11: Should be invalid`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 11: ${e}`);
		failed++;
	}

	// Test 12: Built-in variables without explicit definition
	try {
		const result = await processor.process('{{date}} {{time}}', []);
		const pattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
		if (pattern.test(result)) {
			console.log('[PASS] Test 12: Built-in variables without definition');
			passed++;
		} else {
			console.log(`[FAIL] Test 12: Pattern mismatch, got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 12: ${e}`);
		failed++;
	}

	// Test 13: Date format - Month DD, YYYY
	try {
		const result = await processor.process('{{date}}', [
			{ name: 'date', type: 'date', dateFormat: 'Month DD, YYYY' }
		]);
		const pattern = /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{2}, \d{4}$/;
		if (pattern.test(result)) {
			console.log('[PASS] Test 13: Date format (Month DD, YYYY)');
			passed++;
		} else {
			console.log(`[FAIL] Test 13: Expected month name format, got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 13: ${e}`);
		failed++;
	}

	// Test 14: Time format - 12h
	try {
		const result = await processor.process('{{time}}', [
			{ name: 'time', type: 'time', timeFormat: '12h' }
		]);
		const pattern = /^\d{1,2}:\d{2} (AM|PM)$/;
		if (pattern.test(result)) {
			console.log('[PASS] Test 14: Time format (12h)');
			passed++;
		} else {
			console.log(`[FAIL] Test 14: Expected 12h format, got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 14: ${e}`);
		failed++;
	}

	// Test 15: Empty selection
	try {
		const result = await processor.process('Text: {{selection}}', [
			{ name: 'selection', type: 'selection' }
		]);
		if (result === 'Text: ') {
			console.log('[PASS] Test 15: Empty selection handling');
			passed++;
		} else {
			console.log(`[FAIL] Test 15: Expected 'Text: ', got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 15: ${e}`);
		failed++;
	}

	// Test 16: Complex multi-line template
	try {
		const template = '# Meeting\nDate: {{date}}\n\n{{cursor}}\n\nNotes: {{selection}}';
		const result = await processor.process(template, [
			{ name: 'date', type: 'date', dateFormat: 'YYYY-MM-DD' },
			{ name: 'selection', type: 'selection' }
		], 'important');
		const hasDate = /Date: \d{4}-\d{2}-\d{2}/.test(result);
		const hasCursor = result.includes('{{cursor}}');
		const hasSelection = result.includes('Notes: important');
		if (hasDate && hasCursor && hasSelection) {
			console.log('[PASS] Test 16: Complex multi-line template');
			passed++;
		} else {
			console.log(`[FAIL] Test 16: Template processing incomplete, got: ${result}`);
			failed++;
		}
	} catch (e) {
		console.log(`[FAIL] Test 16: ${e}`);
		failed++;
	}

	// Summary
	console.log(`\n${'='.repeat(50)}`);
	console.log(`Test Results: ${passed} passed, ${failed} failed`);
	console.log(`Total: ${passed + failed} tests`);
	console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
	console.log(`${'='.repeat(50)}`);

	if (failed === 0) {
		console.log('\nAll tests passed!');
	} else {
		console.log(`\n${failed} test(s) failed. Please review.`);
		process.exit(1);
	}
}

runTests().catch(console.error);
