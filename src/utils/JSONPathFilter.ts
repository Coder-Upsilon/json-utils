import * as JSONPath from 'jsonpath';
import { CodeMirrorManager } from './CodeMirrorManager';
import type * as CodeMirror from 'codemirror';

export class JSONPathFilter {
  private inputEditor!: CodeMirror.Editor;
  private outputEditor!: CodeMirror.Editor;
  private jsonPathInput!: HTMLInputElement;
  private resultCount!: HTMLElement;
  private resultType!: HTMLElement;

  constructor() {
    this.initializeElements();
    this.initializeEditors();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.jsonPathInput = document.getElementById('jsonpath-input') as HTMLInputElement;
    this.resultCount = document.getElementById('result-count') as HTMLElement;
    this.resultType = document.getElementById('result-type') as HTMLElement;
  }

  private initializeEditors(): void {
    // Initialize input editor using CodeMirrorManager
    const inputEditor = CodeMirrorManager.initializeEditor('jsonFilterInput', {
      mode: 'application/json',
      readOnly: false
    });

    if (inputEditor) {
      this.inputEditor = inputEditor;
    } else {
      throw new Error('Failed to initialize input editor');
    }

    // Initialize output editor using CodeMirrorManager
    const outputEditor = CodeMirrorManager.initializeEditor('jsonFilterOutput', {
      mode: 'application/json',
      readOnly: true
    });
    
    if (outputEditor) {
      this.outputEditor = outputEditor;
    } else {
      throw new Error('Failed to initialize output editor');
    }
  }

  private attachEventListeners(): void {
    const filterBtn = document.getElementById('filterBtn');
    const clearBtn = document.getElementById('clearFilterBtn');
    const clearInputBtn = document.getElementById('clearFilterInputBtn');
    const exampleBtn = document.getElementById('loadFilterSampleBtn');
    const copyResultBtn = document.getElementById('copyFilterBtn');
    const downloadResultBtn = document.getElementById('downloadFilterBtn');
    const toggleHelpBtn = document.getElementById('toggle-help');

    if (filterBtn) {
      filterBtn.addEventListener('click', () => this.filterJSON());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAll());
    }

    if (clearInputBtn) {
      clearInputBtn.addEventListener('click', () => this.clearInput());
    }

    if (exampleBtn) {
      exampleBtn.addEventListener('click', () => this.loadExample());
    }

    if (copyResultBtn) {
      copyResultBtn.addEventListener('click', () => this.copyResult());
    }


    if (downloadResultBtn) {
      downloadResultBtn.addEventListener('click', () => this.downloadResult());
    }

    if (toggleHelpBtn) {
      toggleHelpBtn.addEventListener('click', () => this.closeDrawer());
    }

    // Add drawer trigger button event listener
    const drawerTrigger = document.getElementById('drawer-trigger');
    if (drawerTrigger) {
      drawerTrigger.addEventListener('click', () => this.openDrawer());
    }

    // Add click handlers for example items
    const exampleItems = document.querySelectorAll('.example-item');
    exampleItems.forEach(item => {
      item.addEventListener('click', () => {
        const expression = item.getAttribute('data-expression');
        if (expression && this.jsonPathInput) {
          this.jsonPathInput.value = expression;
          this.filterJSON();
        }
      });
    });

    // Real-time filtering on input change
    if (this.jsonPathInput) {
      this.jsonPathInput.addEventListener('input', () => {
        this.debounce(() => this.filterJSON(), 300)();
      });
    }

    // Setup dynamic height behavior for JSONPath input
    this.setupDynamicHeight();
  }

  private debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  private filterJSON(): void {
    const jsonText = this.inputEditor?.getValue().trim();
    const jsonPathExpression = this.jsonPathInput?.value.trim();

    if (!jsonText || !jsonPathExpression) {
      this.clearResults();
      return;
    }

    try {
      const jsonData = JSON.parse(jsonText);
      const results = JSONPath.query(jsonData, jsonPathExpression);
      
      this.displayResults(results);
      this.updateResultInfo(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.displayError(`Error: ${errorMessage}`);
    }
  }

  private displayResults(results: any[]): void {
    if (!this.outputEditor) return;

    if (results.length === 0) {
      this.outputEditor.setValue('No matches found');
      return;
    }

    // Format the results nicely
    let output: string;
    if (results.length === 1) {
      output = JSON.stringify(results[0], null, 2);
    } else {
      output = JSON.stringify(results, null, 2);
    }

    this.outputEditor.setValue(output);
  }

  private displayError(message: string): void {
    if (this.outputEditor) {
      this.outputEditor.setValue(message);
    }
    this.clearResultInfo();
  }

  private updateResultInfo(results: any[]): void {
    if (this.resultCount) {
      this.resultCount.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
    }

    if (this.resultType && results.length > 0) {
      const firstResult = results[0];
      const type = Array.isArray(firstResult) ? 'Array' : typeof firstResult;
      this.resultType.textContent = `Type: ${type}`;
    }
  }

  private clearResultInfo(): void {
    if (this.resultCount) {
      this.resultCount.textContent = '';
    }
    if (this.resultType) {
      this.resultType.textContent = '';
    }
  }

  private clearResults(): void {
    if (this.outputEditor) {
      this.outputEditor.setValue('');
    }
    this.clearResultInfo();
  }

  private clearInput(): void {
    if (this.inputEditor) {
      this.inputEditor.setValue('');
    }
  }

  private clearAll(): void {
    if (this.inputEditor) {
      this.inputEditor.setValue('');
    }
    if (this.jsonPathInput) {
      this.jsonPathInput.value = '';
    }
    this.clearResults();
  }


  private loadExample(): void {
    const exampleJSON = {
      "store": {
        "book": [
          {
            "category": "reference",
            "author": "Nigel Rees",
            "title": "Sayings of the Century",
            "price": 8.95
          },
          {
            "category": "fiction",
            "author": "Evelyn Waugh",
            "title": "Sword of Honour",
            "price": 12.99
          },
          {
            "category": "fiction",
            "author": "Herman Melville",
            "title": "Moby Dick",
            "isbn": "0-553-21311-3",
            "price": 8.99
          },
          {
            "category": "fiction",
            "author": "J. R. R. Tolkien",
            "title": "The Lord of the Rings",
            "isbn": "0-395-19395-8",
            "price": 22.99
          }
        ],
        "bicycle": {
          "color": "red",
          "price": 19.95
        }
      }
    };

    if (this.inputEditor) {
      this.inputEditor.setValue(JSON.stringify(exampleJSON, null, 2));
    }

    if (this.jsonPathInput) {
      this.jsonPathInput.value = '$.store.book[*].title';
    }

    // Trigger filtering with the example
    this.filterJSON();
  }

  private async copyResult(): Promise<void> {
    const result = this.outputEditor?.getValue();
    if (!result) {
      alert('No result to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
      alert('Result copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = result;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Result copied to clipboard!');
    }
  }

  private downloadResult(): void {
    const result = this.outputEditor?.getValue();
    if (!result) {
      alert('No result to download');
      return;
    }

    const blob = new Blob([result], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jsonpath-result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private openDrawer(): void {
    const helpPanel = document.querySelector('.help-panel') as HTMLElement;
    const layout = document.querySelector('.jsonpath-layout') as HTMLElement;
    const drawerTrigger = document.getElementById('drawer-trigger') as HTMLElement;
    
    if (helpPanel) {
      // Toggle functionality: if panel is visible, hide it; if hidden, show it
      if (helpPanel.classList.contains('open')) {
        // Hide the panel
        helpPanel.classList.remove('open');
        helpPanel.classList.add('hidden');
        
        // Remove layout adjustment
        if (layout) {
          layout.classList.remove('drawer-open');
        }
        
        // Show trigger button
        if (drawerTrigger) {
          drawerTrigger.style.display = 'flex';
        }
      } else {
        // Show the panel
        helpPanel.classList.remove('hidden');
        helpPanel.classList.add('open');
        
        // Add layout adjustment
        if (layout) {
          layout.classList.add('drawer-open');
        }
        
        // Hide trigger button when drawer is open
        if (drawerTrigger) {
          drawerTrigger.style.display = 'none';
        }
      }
    }
  }

  private closeDrawer(): void {
    const helpPanel = document.querySelector('.help-panel') as HTMLElement;
    const layout = document.querySelector('.jsonpath-layout') as HTMLElement;
    const drawerTrigger = document.getElementById('drawer-trigger') as HTMLElement;
    
    if (helpPanel) {
      helpPanel.classList.remove('open');
      helpPanel.classList.add('hidden');
      
      // Remove layout adjustment
      if (layout) {
        layout.classList.remove('drawer-open');
      }
      
      // Show trigger button
      if (drawerTrigger) {
        drawerTrigger.style.display = 'flex';
      }
    }
  }

  private toggleHelpPanel(): void {
    const helpPanel = document.querySelector('.help-panel') as HTMLElement;
    const layout = document.querySelector('.jsonpath-layout') as HTMLElement;
    
    if (helpPanel && layout) {
      if (helpPanel.classList.contains('hidden')) {
        // Show help panel
        helpPanel.classList.remove('hidden');
        layout.style.gridTemplateColumns = '2fr 1fr';
      } else {
        // Hide help panel
        helpPanel.classList.add('hidden');
        layout.style.gridTemplateColumns = '1fr';
      }
    }
  }

  private setupDynamicHeight(): void {
    if (!this.inputEditor) return;

    // Get the CodeMirror wrapper element
    const cmWrapper = this.inputEditor.getWrapperElement();
    if (!cmWrapper) return;

    // Add focus event listener to add custom class and refresh editor
    this.inputEditor.on('focus', () => {
      cmWrapper.classList.add('cm-input-focused');
      setTimeout(() => {
        this.inputEditor.refresh();
      }, 350); // Wait for CSS transition to complete
    });

    // Add blur event listener to remove custom class and refresh editor
    this.inputEditor.on('blur', () => {
      cmWrapper.classList.remove('cm-input-focused');
      setTimeout(() => {
        this.inputEditor.refresh();
      }, 350); // Wait for CSS transition to complete
    });
  }
}
