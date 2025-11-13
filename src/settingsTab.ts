import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import EZReplacePlugin from './main';
import { ReplacementPair } from './types';

// Extend App interface for internal API access
interface ExtendedApp extends App {
	setting: {
		open(): void;
		openTabById(id: string): void;
		close(): void;
	};
	hotkeyManager: {
		getHotkeys(commandId: string): Array<{modifiers: string[], key: string}>;
	};
}

/**
 * Settings tab for EZ Replace plugin
 */
export class EZReplaceSettingTab extends PluginSettingTab {
	plugin: EZReplacePlugin;

	constructor(app: App, plugin: EZReplacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		new Setting(containerEl)
			.setHeading()
			.setName('EZ Replace Settings');

		// Description
		new Setting(containerEl)
			.setDesc('Manage your text replacement pairs. Select text and use the hotkey to replace.');

		// Hotkey configuration section
		this.displayHotkeySection(containerEl);

		// Add new pair button
		new Setting(containerEl)
			.setName('Add new replacement pair')
			.setDesc('Create a new text replacement pair')
			.addButton(button => button
				.setButtonText('Add pair')
				.setCta()
				.onClick(async () => {
					await this.addNewPair();
				}));

		// Import/Export section
		new Setting(containerEl)
			.setName('Backup and restore')
			.setDesc('Export your replacement pairs to JSON or import from a backup file')
			.addButton(button => button
				.setButtonText('Export to JSON')
				.setTooltip('Download all replacement pairs as JSON file')
				.onClick(() => {
					this.exportSettings();
				}))
			.addButton(button => button
				.setButtonText('Import from JSON')
				.setTooltip('Load replacement pairs from JSON file')
				.onClick(() => {
					this.importSettings();
				}));

		// Display existing pairs
		this.displayReplacementPairs(containerEl);
	}

	/**
	 * Display all replacement pairs
	 */
	displayReplacementPairs(containerEl: HTMLElement): void {
		const pairsContainer = containerEl.createDiv('ez-replace-pairs-container');

	if (this.plugin.settings.replacementPairs.length === 0) {
			new Setting(pairsContainer)
				.setDesc('No replacement pairs yet. Add one to get started!');
			return;
		}

		// Display each pair
		this.plugin.settings.replacementPairs.forEach((pair, index) => {
			this.displayReplacementPair(pairsContainer, pair, index);
		});
	}

	/**
	 * Display a single replacement pair
	 */
	displayReplacementPair(container: HTMLElement, pair: ReplacementPair, index: number): void {
		const pairSetting = new Setting(container)
			.setClass('ez-replace-pair-setting');

		// Move up button
		pairSetting.addButton(button => button
			.setIcon('up-chevron-glyph')
			.setTooltip('Move up')
			.onClick(async () => {
				if (index > 0) {
					// Swap with previous item
					const temp = this.plugin.settings.replacementPairs[index - 1];
					this.plugin.settings.replacementPairs[index - 1] = this.plugin.settings.replacementPairs[index];
					this.plugin.settings.replacementPairs[index] = temp;
					await this.plugin.saveSettings();
					this.display();
				}
			}));

		// Move down button
		pairSetting.addButton(button => button
			.setIcon('down-chevron-glyph')
			.setTooltip('Move down')
			.onClick(async () => {
				if (index < this.plugin.settings.replacementPairs.length - 1) {
					// Swap with next item
					const temp = this.plugin.settings.replacementPairs[index + 1];
					this.plugin.settings.replacementPairs[index + 1] = this.plugin.settings.replacementPairs[index];
					this.plugin.settings.replacementPairs[index] = temp;
					await this.plugin.saveSettings();
					this.display();
				}
			}));

		// Source text input
		pairSetting.addText(text => text
			.setPlaceholder('Source text (e.g., ->)')
			.setValue(pair.source)
			.onChange(async (value) => {
				pair.source = value;
				await this.plugin.saveSettings();
			}));

		// Arrow indicator
		pairSetting.settingEl.createSpan({ text: ' → ', cls: 'ez-replace-arrow' });

		// Target text input
		pairSetting.addText(text => text
			.setPlaceholder('Target text (e.g., →)')
			.setValue(pair.target)
			.onChange(async (value) => {
				pair.target = value;
				await this.plugin.saveSettings();
			}));

		// Enable/disable toggle
		pairSetting.addToggle(toggle => toggle
			.setValue(pair.enabled)
			.setTooltip(pair.enabled ? 'Enabled' : 'Disabled')
			.onChange(async (value) => {
				pair.enabled = value;
				await this.plugin.saveSettings();
			}));

		// Advanced options button
		pairSetting.addButton(button => button
			.setIcon('settings')
			.setTooltip('Advanced options')
			.onClick(() => {
				this.toggleAdvancedOptions(container, pair, index);
			}));

		// Delete button
		pairSetting.addButton(button => button
			.setButtonText('Delete')
			.setWarning()
			.onClick(async () => {
				this.plugin.settings.replacementPairs.splice(index, 1);
				await this.plugin.saveSettings();
				this.display(); // Refresh the display
			}));
	}

	/**
	 * Toggle advanced options for a replacement pair
	 */
	toggleAdvancedOptions(container: HTMLElement, pair: ReplacementPair, index: number): void {
		const advancedId = `advanced-${index}`;
		const existingAdvanced = container.querySelector(`#${advancedId}`);

		// If already open, close it
		if (existingAdvanced) {
			existingAdvanced.remove();
			return;
		}

		// Create advanced options container
		const advancedContainer = container.createDiv({
			cls: 'ez-replace-advanced-options',
			attr: { id: advancedId }
		});

		// Description field
		new Setting(advancedContainer)
			.setName('Description')
			.setDesc('Optional description for this replacement pair')
			.addText(text => text
				.setPlaceholder('e.g., Arrow symbol')
				.setValue(pair.description || '')
				.onChange(async (value) => {
					pair.description = value;
					await this.plugin.saveSettings();
				}));

		// Case sensitive option
		new Setting(advancedContainer)
			.setName('Case sensitive')
			.setDesc('Match source text with exact case (uppercase/lowercase)')
			.addToggle(toggle => toggle
				.setValue(pair.caseSensitive !== undefined ? pair.caseSensitive : true)
				.onChange(async (value) => {
					pair.caseSensitive = value;
					await this.plugin.saveSettings();
				}));

		// Whole word option
		new Setting(advancedContainer)
			.setName('Whole word match')
			.setDesc('Only match if source text is a complete word (not part of another word)')
			.addToggle(toggle => toggle
				.setValue(pair.wholeWord !== undefined ? pair.wholeWord : false)
				.onChange(async (value) => {
					pair.wholeWord = value;
					await this.plugin.saveSettings();
				}));
	}

	/**
	 * Add a new replacement pair
	 */
	async addNewPair(): Promise<void> {
		const newPair: ReplacementPair = {
			id: `pair-${Date.now()}`,
			source: '',
			target: '',
			enabled: true,
			description: '',
			caseSensitive: true,
			wholeWord: false
		};

		this.plugin.settings.replacementPairs.push(newPair);
		await this.plugin.saveSettings();
		this.display(); // Refresh the display
	}

	/**
	 * Export replacement pairs to JSON file
	 */
	exportSettings(): void {
		const dataStr = JSON.stringify(this.plugin.settings.replacementPairs, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		
		// Create download link
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `ez-replace-backup-${this.getDateString()}.json`;
		
		// Trigger download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		// Clean up
		URL.revokeObjectURL(url);
	}

	/**
	 * Import replacement pairs from JSON file
	 */
	importSettings(): void {
		// Create file input element
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json,.json';
		
		input.onchange = async (e: Event) => {
			const target = e.target as HTMLInputElement;
			const file = target.files?.[0];
			
			if (!file) {
				return;
			}
			
			try {
				const text = await file.text();
				const importedPairs = JSON.parse(text);
				
				// Validate imported data
				if (!Array.isArray(importedPairs)) {
					throw new Error('Invalid format: Expected an array of replacement pairs');
				}
				
				// Validate each pair has required fields
				for (const pair of importedPairs) {
					if (!pair.source || !pair.target) {
						throw new Error('Invalid format: Each pair must have source and target fields');
					}
				}
				
				// Show import options dialog
				this.showImportDialog(importedPairs);
				
			} catch (error) {
				console.error('Import failed:', error);
				new Notice(`✗ Import failed: ${error.message}`);
			}
		};
		
		// Trigger file picker
		input.click();
	}

	/**
	 * Show dialog with import options
	 */
	showImportDialog(importedPairs: ReplacementPair[]): void {
		const currentCount = this.plugin.settings.replacementPairs.length;
		const importCount = importedPairs.length;
		
		// Create modal overlay
		const overlay = document.createElement('div');
		overlay.className = 'ez-replace-import-overlay';
		
		// Create modal
		const modal = document.createElement('div');
		modal.className = 'ez-replace-import-modal';
		
		const message = document.createElement('div');
		message.className = 'ez-replace-import-modal-message';
		message.textContent = `Found ${importCount} replacement pairs in the file. You currently have ${currentCount} pairs. How would you like to import?`;
		modal.appendChild(message);
		
		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'ez-replace-import-modal-buttons';
		
		const replaceBtn = document.createElement('button');
		replaceBtn.textContent = `Replace (${currentCount} → ${importCount})`;
		replaceBtn.className = 'mod-warning';
		replaceBtn.onclick = async () => {
			this.plugin.settings.replacementPairs = importedPairs;
			await this.plugin.saveSettings();
			this.display();
			new Notice(`✓ Replaced all pairs. Now you have ${importCount} replacement pairs.`);
			document.body.removeChild(modal);
			document.body.removeChild(overlay);
		};
		
		const mergeBtn = document.createElement('button');
		mergeBtn.textContent = `Merge (${currentCount} + ${importCount})`;
		mergeBtn.className = 'mod-cta';
		mergeBtn.onclick = async () => {
			this.plugin.settings.replacementPairs.push(...importedPairs);
			await this.plugin.saveSettings();
			this.display();
			new Notice(`✓ Merged successfully. Now you have ${this.plugin.settings.replacementPairs.length} replacement pairs.`);
			document.body.removeChild(modal);
			document.body.removeChild(overlay);
		};
		
		const cancelBtn = document.createElement('button');
		cancelBtn.textContent = 'Cancel';
		cancelBtn.onclick = () => {
			document.body.removeChild(modal);
			document.body.removeChild(overlay);
		};
		
		buttonContainer.appendChild(cancelBtn);
		buttonContainer.appendChild(mergeBtn);
		buttonContainer.appendChild(replaceBtn);
		modal.appendChild(buttonContainer);
		
		overlay.onclick = () => {
			document.body.removeChild(modal);
			document.body.removeChild(overlay);
		};
		
		document.body.appendChild(overlay);
		document.body.appendChild(modal);
	}

	/**
	 * Get formatted date string for filename
	 */
	getDateString(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		
		return `${year}${month}${day}-${hours}${minutes}`;
	}

	/**
	 * Display hotkey configuration section
	 */
	displayHotkeySection(containerEl: HTMLElement): void {
		const hotkeySection = containerEl.createDiv('ez-replace-hotkey-section');
		
		// Get current hotkeys for this plugin's command
		const app = this.app as ExtendedApp;
		const hotkeys = app.hotkeyManager.getHotkeys('ez-replace:replace-selected-text');
		
		new Setting(hotkeySection)
			.setName('Hotkey configuration')
			.setDesc(this.getHotkeyDescription(hotkeys))
			.addButton(button => button
				.setButtonText('Configure Hotkey')
				.setTooltip('Open Obsidian hotkey settings')
				.onClick(() => {
					this.openHotkeySettings();
				}));
	}

	/**
	 * Get description text for current hotkeys
	 */
	getHotkeyDescription(hotkeys: Array<{modifiers: string[], key: string}>): string {
		if (!hotkeys || hotkeys.length === 0) {
			return 'No hotkey configured. Click below to set one up.';
		}
		
		const hotkeyStrings = hotkeys.map((hotkey) => {
			const modifiers: string[] = [];
			if (hotkey.modifiers) {
				modifiers.push(...hotkey.modifiers);
			}
			modifiers.push(hotkey.key);
			return modifiers.join('+');
		});
		
		return `Current hotkey: ${hotkeyStrings.join(' or ')}`;
	}

	/**
	 * Open Obsidian's hotkey settings
	 */
	openHotkeySettings(): void {
		const app = this.app as ExtendedApp;
		
		// Close current settings
		app.setting.close();
		
		// Open settings and navigate to hotkeys
		app.setting.open();
		app.setting.openTabById('hotkeys');
		
		// Try to filter/search for our plugin
		setTimeout(() => {
			const searchInput = document.querySelector('.setting-search-input') as HTMLInputElement;
			if (searchInput) {
				searchInput.value = 'EZ Replace';
				searchInput.dispatchEvent(new Event('input', { bubbles: true }));
			}
		}, 100);
	}
}
