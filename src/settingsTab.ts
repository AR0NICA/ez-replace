import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import EZReplacePlugin from './main';
import { ReplacementPair, SortField, SortOrder } from './types';

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
	private filteredPairs: ReplacementPair[] = [];
	private pairsContainerEl: HTMLElement | null = null;

	constructor(app: App, plugin: EZReplacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Get all unique tags from replacement pairs
	 */
	getAllTags(): string[] {
		const tagSet = new Set<string>();
		for (const pair of this.plugin.settings.replacementPairs) {
			if (pair.tags) {
				for (const tag of pair.tags) {
					tagSet.add(tag);
				}
			}
		}
		return Array.from(tagSet).sort();
	}

	/**
	 * Filter replacement pairs based on search query and selected tags
	 */
	filterPairs(): ReplacementPair[] {
		const { searchQuery, selectedTags } = this.plugin.settings.searchFilter;
		const query = searchQuery.toLowerCase().trim();

		let pairs = this.plugin.settings.replacementPairs;

		// Filter by search query
		if (query) {
			pairs = pairs.filter(pair => {
				const source = pair.source.toLowerCase();
				const target = pair.target.toLowerCase();
				const description = (pair.description || '').toLowerCase();
				const tags = (pair.tags || []).join(' ').toLowerCase();

				return source.includes(query) ||
					target.includes(query) ||
					description.includes(query) ||
					tags.includes(query);
			});
		}

		// Filter by selected tags
		if (selectedTags.length > 0) {
			pairs = pairs.filter(pair => {
				if (!pair.tags || pair.tags.length === 0) return false;
				return selectedTags.some(tag => pair.tags!.includes(tag));
			});
		}

		return pairs;
	}

	/**
	 * Sort filtered pairs based on current sort settings
	 */
	sortPairs(pairs: ReplacementPair[]): ReplacementPair[] {
		const { sortField, sortOrder } = this.plugin.settings.searchFilter;
		
		const sorted = [...pairs].sort((a, b) => {
			let comparison = 0;
			
			switch (sortField) {
				case 'name':
					comparison = a.source.localeCompare(b.source);
					break;
				case 'createdAt':
					comparison = (a.createdAt || 0) - (b.createdAt || 0);
					break;
				case 'usageCount':
					comparison = (a.usageCount || 0) - (b.usageCount || 0);
					break;
				case 'lastUsedAt':
					comparison = (a.lastUsedAt || 0) - (b.lastUsedAt || 0);
					break;
			}
			
			return sortOrder === 'asc' ? comparison : -comparison;
		});
		
		return sorted;
	}

	/**
	 * Refresh only the pairs list without full redraw
	 */
	refreshPairsList(): void {
		if (!this.pairsContainerEl) return;
		
		this.pairsContainerEl.empty();
		this.filteredPairs = this.sortPairs(this.filterPairs());
		
		if (this.filteredPairs.length === 0) {
			const { searchQuery, selectedTags } = this.plugin.settings.searchFilter;
			if (searchQuery || selectedTags.length > 0) {
				new Setting(this.pairsContainerEl)
					.setDesc('No pairs match your search criteria.');
			} else {
				new Setting(this.pairsContainerEl)
					.setDesc('No replacement pairs yet. Add one to get started!');
			}
			return;
		}

		// Display count info
		const totalCount = this.plugin.settings.replacementPairs.length;
		const filteredCount = this.filteredPairs.length;
		if (filteredCount !== totalCount) {
			const countInfo = this.pairsContainerEl.createDiv('ez-replace-filter-info');
			countInfo.setText(`Showing ${filteredCount} of ${totalCount} pairs`);
		}

		// Display each filtered pair
		this.filteredPairs.forEach((pair) => {
			const originalIndex = this.plugin.settings.replacementPairs.findIndex(p => p.id === pair.id);
			this.displayReplacementPair(this.pairsContainerEl!, pair, originalIndex);
		});
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		new Setting(containerEl)
			.setHeading()
			.setName('Ez replace settings');

		// Description
		new Setting(containerEl)
			.setDesc('Manage your text replacement pairs. Select text and use the hotkey to replace.');

		// Hotkey configuration section
		this.displayHotkeySection(containerEl);

		// Auto-complete suggester section
		this.displaySuggesterSection(containerEl);

		// Statistics dashboard section (v1.2.0)
		this.displayStatisticsSection(containerEl);

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

		// Search and Filter section (v1.2.0)
		this.displaySearchFilterSection(containerEl);

		// Display existing pairs
		this.displayReplacementPairs(containerEl);
	}

	/**
	 * Display search and filter section (v1.2.0)
	 */
	displaySearchFilterSection(containerEl: HTMLElement): void {
		const searchSection = containerEl.createDiv('ez-replace-search-section');

		// Section header
		new Setting(searchSection)
			.setHeading()
			.setName('Search and filter');

		// Search bar
		const searchSetting = new Setting(searchSection)
			.setName('Search pairs')
			.setDesc('Filter by source, target, description, or tags');

		searchSetting.addText(text => {
			text
				.setPlaceholder('Type to search...')
				.setValue(this.plugin.settings.searchFilter.searchQuery)
				.onChange(async (value) => {
					this.plugin.settings.searchFilter.searchQuery = value;
					// Don't save search query to persistent storage, just filter
					this.refreshPairsList();
				});

			// Add clear button if there's a query
			text.inputEl.addClass('ez-replace-search-input');
		});

		// Clear search button
		searchSetting.addButton(button => button
			.setIcon('x')
			.setTooltip('Clear search')
			.onClick(async () => {
				this.plugin.settings.searchFilter.searchQuery = '';
				this.refreshPairsList();
				this.display(); // Refresh to clear input field
			}));

		// Tag filter (only show if there are tags)
		const allTags = this.getAllTags();
		if (allTags.length > 0) {
			const tagSetting = new Setting(searchSection)
				.setName('Filter by tags')
				.setDesc('Show only pairs with selected tags');

			// Create tag buttons container
			const tagContainer = tagSetting.settingEl.createDiv('ez-replace-tag-filter-container');
			
			allTags.forEach(tag => {
				const isSelected = this.plugin.settings.searchFilter.selectedTags.includes(tag);
				const tagButton = tagContainer.createEl('button', {
					text: tag,
					cls: `ez-replace-tag-button ${isSelected ? 'is-selected' : ''}`
				});
				
				tagButton.onclick = async () => {
					const selectedTags = this.plugin.settings.searchFilter.selectedTags;
					const tagIndex = selectedTags.indexOf(tag);
					
					if (tagIndex === -1) {
						selectedTags.push(tag);
					} else {
						selectedTags.splice(tagIndex, 1);
					}
					
					this.refreshPairsList();
					this.display(); // Refresh to update tag button states
				};
			});

			// Clear tags button
			if (this.plugin.settings.searchFilter.selectedTags.length > 0) {
				tagSetting.addButton(button => button
					.setButtonText('Clear tags')
					.onClick(async () => {
						this.plugin.settings.searchFilter.selectedTags = [];
						this.refreshPairsList();
						this.display();
					}));
			}
		}

		// Sort options
		new Setting(searchSection)
			.setName('Sort by')
			.setDesc('Choose how to order replacement pairs')
			.addDropdown(dropdown => dropdown
				.addOption('name', 'Name (source)')
				.addOption('createdAt', 'Date created')
				.addOption('usageCount', 'Usage count')
				.addOption('lastUsedAt', 'Last used')
				.setValue(this.plugin.settings.searchFilter.sortField)
				.onChange(async (value: SortField) => {
					this.plugin.settings.searchFilter.sortField = value;
					await this.plugin.saveSettings();
					this.refreshPairsList();
				}))
			.addDropdown(dropdown => dropdown
				.addOption('asc', 'Ascending')
				.addOption('desc', 'Descending')
				.setValue(this.plugin.settings.searchFilter.sortOrder)
				.onChange(async (value: SortOrder) => {
					this.plugin.settings.searchFilter.sortOrder = value;
					await this.plugin.saveSettings();
					this.refreshPairsList();
				}));
	}

	/**
	 * Display all replacement pairs
	 */
	displayReplacementPairs(containerEl: HTMLElement): void {
		this.pairsContainerEl = containerEl.createDiv('ez-replace-pairs-container');
		
		// Apply filtering and sorting
		this.filteredPairs = this.sortPairs(this.filterPairs());

		if (this.filteredPairs.length === 0) {
			const { searchQuery, selectedTags } = this.plugin.settings.searchFilter;
			if (searchQuery || selectedTags.length > 0) {
				new Setting(this.pairsContainerEl)
					.setDesc('No pairs match your search criteria.');
			} else {
				new Setting(this.pairsContainerEl)
					.setDesc('No replacement pairs yet. Add one to get started!');
			}
			return;
		}

		// Display count info
		const totalCount = this.plugin.settings.replacementPairs.length;
		const filteredCount = this.filteredPairs.length;
		if (filteredCount !== totalCount) {
			const countInfo = this.pairsContainerEl.createDiv('ez-replace-filter-info');
			countInfo.setText(`Showing ${filteredCount} of ${totalCount} pairs`);
		}

		// Display each filtered pair
		this.filteredPairs.forEach((pair) => {
			const originalIndex = this.plugin.settings.replacementPairs.findIndex(p => p.id === pair.id);
			this.displayReplacementPair(this.pairsContainerEl!, pair, originalIndex);
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
				.setPlaceholder('E.g., arrow symbol')
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

		// Tags field (v1.2.0)
		const tagsSetting = new Setting(advancedContainer)
			.setName('Tags')
			.setDesc('Comma-separated tags for categorization (e.g., math, arrows, greek)');

		tagsSetting.addText(text => text
			.setPlaceholder('tag1, tag2, tag3')
			.setValue((pair.tags || []).join(', '))
			.onChange(async (value) => {
				// Parse comma-separated tags
				const tags = value
					.split(',')
					.map(t => t.trim().toLowerCase())
					.filter(t => t.length > 0);
				pair.tags = tags;
				await this.plugin.saveSettings();
			}));

		// Quick tag buttons from existing tags
		const existingTags = this.getAllTags();
		if (existingTags.length > 0) {
			const quickTagsContainer = advancedContainer.createDiv('ez-replace-quick-tags');
			quickTagsContainer.createSpan({ text: 'Quick add: ', cls: 'ez-replace-quick-tags-label' });
			
			existingTags.forEach(tag => {
				const hasTag = pair.tags?.includes(tag);
				if (!hasTag) {
					const tagBtn = quickTagsContainer.createEl('button', {
						text: `+ ${tag}`,
						cls: 'ez-replace-quick-tag-btn'
					});
					tagBtn.onclick = async () => {
						if (!pair.tags) pair.tags = [];
						if (!pair.tags.includes(tag)) {
							pair.tags.push(tag);
							await this.plugin.saveSettings();
							this.display();
						}
					};
				}
			});
		}

		// Usage statistics display (v1.2.0)
		const usageCount = pair.usageCount || 0;
		const lastUsed = pair.lastUsedAt 
			? new Date(pair.lastUsedAt).toLocaleString() 
			: 'Never';
		const created = pair.createdAt 
			? new Date(pair.createdAt).toLocaleString() 
			: 'Unknown';

		new Setting(advancedContainer)
			.setName('Statistics')
			.setDesc(`Used ${usageCount} times | Last used: ${lastUsed} | Created: ${created}`);
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
			wholeWord: false,
			// v1.2.0 fields
			tags: [],
			createdAt: Date.now(),
			usageCount: 0,
			lastUsedAt: undefined
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
				.setButtonText('Configure hotkey')
				.setTooltip('Open Obsidian hotkey settings')
				.onClick(() => {
					this.openHotkeySettings();
				}));
	}

	/**
	 * Display auto-complete suggester section
	 */
	displaySuggesterSection(containerEl: HTMLElement): void {
		const suggesterSection = containerEl.createDiv('ez-replace-suggester-section');
		
		// Section header
		new Setting(suggesterSection)
			.setHeading()
			.setName('Auto-complete suggester');

		// Enable/disable suggester
		new Setting(suggesterSection)
			.setName('Enable auto-complete')
			.setDesc('Show suggestions while typing to quickly replace text')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.suggester.enabled)
				.onChange(async (value) => {
					this.plugin.settings.suggester.enabled = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide other options
				}));

		// Only show other options if suggester is enabled
		if (!this.plugin.settings.suggester.enabled) {
			return;
		}

		// Minimum characters
		new Setting(suggesterSection)
			.setName('Minimum characters')
			.setDesc('Minimum number of characters to trigger suggestions (1-5)')
			.addSlider(slider => slider
				.setLimits(1, 5, 1)
				.setValue(this.plugin.settings.suggester.minCharacters)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.suggester.minCharacters = value;
					await this.plugin.saveSettings();
				}));

		// Maximum suggestions
		new Setting(suggesterSection)
			.setName('Maximum suggestions')
			.setDesc('Maximum number of suggestions to show (3-10)')
			.addSlider(slider => slider
				.setLimits(3, 10, 1)
				.setValue(this.plugin.settings.suggester.maxSuggestions)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.suggester.maxSuggestions = value;
					await this.plugin.saveSettings();
				}));

		// Matching mode
		new Setting(suggesterSection)
			.setName('Matching mode')
			.setDesc('Prefix: matches from start. Fuzzy: matches characters in order anywhere')
			.addDropdown(dropdown => dropdown
				.addOption('prefix', 'Prefix matching')
				.addOption('fuzzy', 'Fuzzy matching')
				.setValue(this.plugin.settings.suggester.matchingMode)
				.onChange(async (value: 'prefix' | 'fuzzy') => {
					this.plugin.settings.suggester.matchingMode = value;
					await this.plugin.saveSettings();
				}));

		// Show description
		new Setting(suggesterSection)
			.setName('Show descriptions')
			.setDesc('Display description text in suggestion popup')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.suggester.showDescription)
				.onChange(async (value) => {
					this.plugin.settings.suggester.showDescription = value;
					await this.plugin.saveSettings();
				}));

		// Case sensitive
		new Setting(suggesterSection)
			.setName('Case sensitive matching')
			.setDesc('Match source text with exact case')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.suggester.caseSensitive)
				.onChange(async (value) => {
					this.plugin.settings.suggester.caseSensitive = value;
					await this.plugin.saveSettings();
				}));

		// Accept keys
		new Setting(suggesterSection)
			.setName('Confirmation keys')
			.setDesc('Keys to accept and apply suggestions')
			.addDropdown(dropdown => dropdown
				.addOption('both', 'Tab and Enter')
				.addOption('tab', 'Tab only')
				.addOption('enter', 'Enter only')
				.setValue(this.plugin.settings.suggester.acceptKeys)
				.onChange(async (value: 'tab' | 'enter' | 'both') => {
					this.plugin.settings.suggester.acceptKeys = value;
					await this.plugin.saveSettings();
				}));
	}

	/**
	 * Display usage statistics dashboard (v1.2.0)
	 */
	displayStatisticsSection(containerEl: HTMLElement): void {
		const statsSection = containerEl.createDiv('ez-replace-stats-section');

		// Section header
		new Setting(statsSection)
			.setHeading()
			.setName('Usage statistics');

		// Get statistics
		const totalReplacements = this.plugin.settings.statistics.totalReplacements || 0;
		const pairs = this.plugin.settings.replacementPairs;
		
		// Calculate top used pairs
		const sortedByUsage = [...pairs]
			.filter(p => (p.usageCount || 0) > 0)
			.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
			.slice(0, 5);

		// Total replacements
		new Setting(statsSection)
			.setName('Total replacements')
			.setDesc(`You have made ${totalReplacements} replacements total.`);

		// Most used pairs
		if (sortedByUsage.length > 0) {
			const topPairsSetting = new Setting(statsSection)
				.setName('Most used pairs');
			
			const topList = statsSection.createDiv('ez-replace-top-pairs-list');
			sortedByUsage.forEach((pair, idx) => {
				const item = topList.createDiv('ez-replace-top-pair-item');
				item.createSpan({ 
					text: `${idx + 1}. `,
					cls: 'ez-replace-top-pair-rank'
				});
				item.createSpan({ 
					text: `${pair.source} → ${pair.target}`,
					cls: 'ez-replace-top-pair-text'
				});
				item.createSpan({ 
					text: ` (${pair.usageCount} uses)`,
					cls: 'ez-replace-top-pair-count'
				});
			});
		} else {
			new Setting(statsSection)
				.setDesc('No usage data yet. Start using replacements to see statistics!');
		}

		// Reset statistics button
		new Setting(statsSection)
			.setName('Reset statistics')
			.setDesc('Clear all usage data')
			.addButton(button => button
				.setButtonText('Reset')
				.setWarning()
				.onClick(async () => {
					// Reset global stats
					this.plugin.settings.statistics.totalReplacements = 0;
					this.plugin.settings.statistics.lastResetAt = Date.now();
					
					// Reset individual pair stats
					for (const pair of this.plugin.settings.replacementPairs) {
						pair.usageCount = 0;
						pair.lastUsedAt = undefined;
					}
					
					await this.plugin.saveSettings();
					new Notice('Statistics have been reset.');
					this.display();
				}));

		// Export statistics
		new Setting(statsSection)
			.setName('Export statistics')
			.setDesc('Download usage statistics as JSON')
			.addButton(button => button
				.setButtonText('Export stats')
				.onClick(() => {
					this.exportStatistics();
				}));
	}

	/**
	 * Export usage statistics to JSON file
	 */
	exportStatistics(): void {
		const stats = {
			exportedAt: new Date().toISOString(),
			totalReplacements: this.plugin.settings.statistics.totalReplacements || 0,
			pairs: this.plugin.settings.replacementPairs.map(pair => ({
				source: pair.source,
				target: pair.target,
				usageCount: pair.usageCount || 0,
				lastUsedAt: pair.lastUsedAt ? new Date(pair.lastUsedAt).toISOString() : null,
				tags: pair.tags || []
			}))
		};

		const dataStr = JSON.stringify(stats, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `ez-replace-statistics-${this.getDateString()}.json`;
		
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		
		new Notice('Statistics exported successfully!');
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
