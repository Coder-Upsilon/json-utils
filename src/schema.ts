// Schema page specific imports
import './styles/main.css';
import { CodeMirrorManager } from './utils/CodeMirrorManager';
import { JSONSchemaInferrer } from './utils/JSONSchemaInferrer';
import { LocalStorageManager, STORAGE_KEYS } from './utils/LocalStorageManager';
import type * as CodeMirror from 'codemirror';

interface SchemaElements {
  clearBtn2: HTMLButtonElement;
  loadSampleBtn: HTMLButtonElement;
  copyBtn2: HTMLButtonElement;
  downloadBtn2: HTMLButtonElement;
  inputStatus: HTMLElement;
  outputStatus: HTMLElement;
  schemaFormatRadios: NodeListOf<HTMLInputElement>;
}

type StatusType = 'success' | 'error' | 'info';

class SchemaInferrer {
  private elements!: SchemaElements;
  private inputEditor!: CodeMirror.Editor;
  private outputEditor!: CodeMirror.Editor;
  private lastValidJSON: any = null;
  private inferrer: JSONSchemaInferrer;
  private storageManager: LocalStorageManager;

  constructor() {
    this.inferrer = new JSONSchemaInferrer();
    this.storageManager = new LocalStorageManager({
      key: STORAGE_KEYS.SCHEMA_DETECTOR,
      autoSave: true,
      debounceMs: 500
    });
    this.initializeElements();
    this.initializeEditors();
    this.attachEventListeners();
    this.loadSavedContent();
    this.storageManager.setupSyncEnabledListener(() => this.inputEditor.getValue());
  }

  private initializeElements(): void {
    this.elements = {
      clearBtn2: this.getElementById('clearBtn2') as HTMLButtonElement,
      loadSampleBtn: this.getElementById('loadSampleBtn') as HTMLButtonElement,
      copyBtn2: this.getElementById('copyBtn2') as HTMLButtonElement,
      downloadBtn2: this.getElementById('downloadBtn2') as HTMLButtonElement,
      inputStatus: this.getElementById('inputStatus'),
      outputStatus: this.getElementById('outputStatus'),
      schemaFormatRadios: document.querySelectorAll('input[name="schemaFormat"]') as NodeListOf<HTMLInputElement>,
    };
  }

  private getElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id "${id}" not found`);
    }
    return element;
  }

  private initializeEditors(): void {
    // Initialize input editor
    const inputEditor = CodeMirrorManager.initializeEditor('jsonInput', {
      mode: 'application/json',
      readOnly: false
    });
    
    if (inputEditor) {
      this.inputEditor = inputEditor;
      this.inputEditor.setOption('readOnly', false);
      
      // Set up real-time validation and auto-save
      this.inputEditor.on('change', () => {
        const content = this.inputEditor.getValue();
        this.storageManager.save(content);
        this.debounce(() => this.validateInput(), 500)();
      });
    } else {
      throw new Error('Failed to initialize input editor');
    }

    // Initialize output editor
    const outputEditor = CodeMirrorManager.initializeEditor('output', {
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
    this.elements.clearBtn2.addEventListener('click', () => this.clearInput());
    this.elements.loadSampleBtn.addEventListener('click', () => this.loadSample());
    this.elements.copyBtn2.addEventListener('click', () => this.copyOutput());
    this.elements.downloadBtn2.addEventListener('click', () => this.downloadOutput());
    
    // Format radio buttons - re-infer with selected format when changed
    this.elements.schemaFormatRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (this.lastValidJSON) {
          this.inferSchema();
        }
      });
    });
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

  private clearInput(): void {
    this.inputEditor.setValue('');
    this.outputEditor.setValue('');
    this.storageManager.clear();
    this.clearStatus();
    this.lastValidJSON = null;
  }

  private loadSample(): void {
    const sampleJSON = {
      "users": [
        {
          "id": 1,
          "name": "Alice",
          "email": "alice@example.com",
          "role": "admin",
          "active": true,
          "lastLogin": "2024-01-15T10:30:00Z"
        },
        {
          "id": 2,
          "name": "Bob",
          "email": "bob@example.com",
          "role": "user",
          "active": true,
          "lastLogin": "2024-01-14T15:45:00Z"
        },
        {
          "id": 3,
          "name": "Charlie",
          "email": "charlie@example.com",
          "role": "user",
          "active": false,
          "lastLogin": null
        }
      ],
      "metadata": {
        "total": 3,
        "page": 1,
        "perPage": 10
      }
    };
    
    const formatted = JSON.stringify(sampleJSON, null, 2);
    this.inputEditor.setValue(formatted);
    this.validateInput();
  }

  private validateInput(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.clearStatus();
      this.lastValidJSON = null;
      this.outputEditor.setValue('');
      return;
    }

    try {
      this.lastValidJSON = JSON.parse(input);
      this.showStatus(this.elements.inputStatus, 'Valid JSON', 'success');
      // Automatically infer schema when JSON is valid
      this.inferSchema();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.lastValidJSON = null;
      this.outputEditor.setValue('');
      this.showStatus(this.elements.inputStatus, `Invalid JSON: ${errorMessage}`, 'error');
    }
  }

  private inferSchema(): void {
    if (!this.lastValidJSON) {
      this.showStatus(this.elements.outputStatus, 'Please enter valid JSON first', 'error');
      return;
    }

    try {
      // Get selected format
      const selectedFormat = Array.from(this.elements.schemaFormatRadios).find(radio => radio.checked)?.value || 'simplified';
      
      let schema: any;
      let formatted: string;
      
      if (selectedFormat === 'jsonschema') {
        // Generate JSON Schema format
        schema = this.inferrer.toJSONSchema(this.lastValidJSON);
        formatted = this.inferrer.formatSchema(schema);
        this.showStatus(this.elements.outputStatus, 'JSON Schema generated successfully', 'success');
      } else {
        // Generate simplified TypeScript-like format
        schema = this.inferrer.inferSchema(this.lastValidJSON);
        formatted = this.inferrer.formatSchema(schema);
        this.showStatus(this.elements.outputStatus, 'Schema inferred successfully', 'success');
      }
      
      this.outputEditor.setValue(formatted);
      this.outputEditor.setOption('mode', 'application/json');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.outputStatus, `Error inferring schema: ${errorMessage}`, 'error');
    }
  }

  private async copyOutput(): Promise<void> {
    const outputText = this.outputEditor.getValue();
    if (!outputText) {
      this.showStatus(this.elements.outputStatus, 'No schema to copy', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      this.showStatus(this.elements.outputStatus, 'Schema copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = outputText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showStatus(this.elements.outputStatus, 'Schema copied to clipboard!', 'success');
    }
  }

  private downloadOutput(): void {
    const outputText = this.outputEditor.getValue();
    if (!outputText) {
      this.showStatus(this.elements.outputStatus, 'No schema to download', 'error');
      return;
    }

    const filename = 'schema.json';
    const blob = new Blob([outputText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showStatus(this.elements.outputStatus, `Schema downloaded as ${filename}`, 'success');
  }

  private showStatus(element: HTMLElement, message: string, type: StatusType): void {
    element.innerHTML = '';
    element.className = `status-inline ${type}`;
    
    if (type === 'error') {
      element.classList.add('collapsed');
    }
    
    const contentSpan = document.createElement('span');
    contentSpan.className = 'error-content';
    contentSpan.textContent = message;
    element.appendChild(contentSpan);
  }

  private clearStatus(): void {
    this.elements.inputStatus.textContent = '';
    this.elements.inputStatus.className = 'status-inline';
    this.elements.outputStatus.textContent = '';
    this.elements.outputStatus.className = 'status-inline';
  }

  /**
   * Load saved content from localStorage on page load
   */
  private loadSavedContent(): void {
    const savedContent = this.storageManager.load();
    if (savedContent && savedContent.trim()) {
      this.inputEditor.setValue(savedContent);
      // Trigger validation after loading
      this.validateInput();
    }
  }
}

// Lazy load heavy dependencies
async function loadDependencies() {
  await Promise.all([
    import('codemirror/mode/javascript/javascript' as any),
    import('codemirror/addon/fold/foldcode' as any),
    import('codemirror/addon/fold/foldgutter' as any),
    import('codemirror/addon/fold/brace-fold' as any),
  ]);
}

// Initialize the schema page
const initializeApp = async () => {
  if (document.getElementById('jsonInput')) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        await loadDependencies();
        new SchemaInferrer();
      }, { timeout: 2000 });
    } else {
      setTimeout(async () => {
        await loadDependencies();
        new SchemaInferrer();
      }, 0);
    }
  }
};

// Use different loading strategies based on document state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
