import { App, Modal, Setting } from 'obsidian';
import EZReplacePlugin from './main';
import { Template, TemplateCategory } from './types';
import { TEMPLATE_LIBRARY, getAllTemplateCategories } from './templateLibrary';

/**
 * Template library browser modal (v1.4.0)
 * Allows users to browse and import pre-built templates
 */
export class TemplateBrowserModal extends Modal {
	plugin: EZReplacePlugin;
	selectedCategory: TemplateCategory | 'all' = 'all';

	constructor(app: App, plugin: EZReplacePlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Template Library' });

		// Category filter
		new Setting(contentEl)
			.setName('Category')
			.setDesc('Filter templates by category')
			.addDropdown(dropdown => {
				dropdown.addOption('all', 'All Categories');
				const categories = getAllTemplateCategories();
				for (const category of categories) {
					dropdown.addOption(category, this.formatCategoryName(category));
				}
				dropdown.setValue(this.selectedCategory);
				dropdown.onChange(value => {
					this.selectedCategory = value as TemplateCategory | 'all';
					this.refreshTemplateList();
				});
			});

		// Template list container
		const listContainer = contentEl.createDiv({ cls: 'ez-replace-template-list' });
		this.renderTemplateList(listContainer);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Refresh template list based on selected category
	 */
	refreshTemplateList() {
		const { contentEl } = this;
		const listContainer = contentEl.querySelector('.ez-replace-template-list') as HTMLElement;
		if (listContainer) {
			listContainer.empty();
			this.renderTemplateList(listContainer);
		}
	}

	/**
	 * Render template list
	 */
	renderTemplateList(container: HTMLElement) {
		const templates = this.getFilteredTemplates();

		if (templates.length === 0) {
			container.createEl('p', { 
				text: 'No templates found in this category.',
				cls: 'ez-replace-no-templates'
			});
			return;
		}

		for (const template of templates) {
			this.renderTemplateItem(container, template);
		}
	}

	/**
	 * Render a single template item
	 */
	renderTemplateItem(container: HTMLElement, template: Template) {
		const item = container.createDiv({ cls: 'ez-replace-template-item' });

		// Header
		const header = item.createDiv({ cls: 'ez-replace-template-header' });
		header.createEl('strong', { text: template.name });
		header.createEl('span', { 
			text: ` [${this.formatCategoryName(template.category)}]`,
			cls: 'ez-replace-template-category'
		});

		// Description
		item.createEl('p', { 
			text: template.description,
			cls: 'ez-replace-template-desc'
		});

		// Example
		const exampleContainer = item.createDiv({ cls: 'ez-replace-template-example' });
		exampleContainer.createEl('div', { text: 'Example:' });
		exampleContainer.createEl('code', { text: `${template.example.input} → ${template.example.output}` });

		// Import button
		new Setting(item)
			.addButton(button => {
				button.setButtonText('Import Template');
				button.onClick(async () => {
					await this.importTemplate(template);
					button.setButtonText('Imported!');
					button.setDisabled(true);
					setTimeout(() => {
						button.setButtonText('Import Template');
						button.setDisabled(false);
					}, 2000);
				});
			});
	}

	/**
	 * Get filtered templates based on selected category
	 */
	getFilteredTemplates(): Template[] {
		if (this.selectedCategory === 'all') {
			return TEMPLATE_LIBRARY;
		}
		return TEMPLATE_LIBRARY.filter(t => t.category === this.selectedCategory);
	}

	/**
	 * Format category name for display
	 */
	formatCategoryName(category: string): string {
		return category
			.split('-')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	/**
	 * Import template into user's replacement pairs
	 */
	async importTemplate(template: Template): Promise<void> {
		// Generate unique ID
		const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Create replacement pair from template
		const newPair = {
			id: id,
			source: template.source,
			target: template.target,
			enabled: true,
			description: template.description,
			tags: [template.category],
			createdAt: Date.now(),
			usageCount: 0,
			isTemplate: true,
			templateVariables: template.variables,
			cursorPosition: template.cursorPosition,
			tabStops: template.tabStops
		};

		// Add to settings
		this.plugin.settings.replacementPairs.push(newPair);
		await this.plugin.saveSettings();
	}
}
