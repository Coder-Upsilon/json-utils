import { jsonrepair } from 'jsonrepair';
import { CodeMirrorManager } from './CodeMirrorManager';
import { JSONSchemaInferrer } from './JSONSchemaInferrer';
import type * as CodeMirror from 'codemirror';

interface JSONUtilsElements {
  clearBtn: HTMLButtonElement;
  loadSampleBtn: HTMLButtonElement;
  parseStringToggle: HTMLInputElement;
  copyToInputBtn: HTMLButtonElement;
  copyBtn: HTMLButtonElement;
  downloadBtn: HTMLButtonElement;
  inputStatus: HTMLElement;
  outputStatus: HTMLElement;
  formatRadios: NodeListOf<HTMLInputElement>;
}

type OutputType = 'json' | 'text';
type StatusType = 'success' | 'error' | 'info';

export class JSONUtils {
  private elements!: JSONUtilsElements;
  private inputEditor!: CodeMirror.Editor;
  private outputEditor!: CodeMirror.Editor;
  private currentOutputType: OutputType = 'json';
  private lastValidJSON: any = null;

  constructor() {
    this.initializeElements();
    this.initializeEditors();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.elements = {
      clearBtn: this.getElementById('clearBtn') as HTMLButtonElement,
      loadSampleBtn: this.getElementById('loadSampleBtn') as HTMLButtonElement,
      parseStringToggle: this.getElementById('parseStringToggle') as HTMLInputElement,
      copyToInputBtn: this.getElementById('copyToInputBtn') as HTMLButtonElement,
      copyBtn: this.getElementById('copyBtn') as HTMLButtonElement,
      downloadBtn: this.getElementById('downloadBtn') as HTMLButtonElement,
      inputStatus: this.getElementById('inputStatus'),
      outputStatus: this.getElementById('outputStatus'),
      formatRadios: document.querySelectorAll('input[name="outputFormat"]') as NodeListOf<HTMLInputElement>,
    };
  }

  private getElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id "${id}" not found`);
    }
    return element;
  }

  private getElementBySelector(selector: string): HTMLElement {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    return element;
  }

  private initializeEditors(): void {
    // Initialize input editor using CodeMirrorManager
    const inputEditor = CodeMirrorManager.initializeEditor('jsonInput', {
      mode: 'application/json',
      readOnly: false
    });
    
    if (inputEditor) {
      this.inputEditor = inputEditor;
      
      // Explicitly ensure the editor is not read-only
      this.inputEditor.setOption('readOnly', false);
      
      // Set up real-time validation
      this.inputEditor.on('change', () => {
        this.debounce(() => this.validateInput(), 500)();
      });
    } else {
      throw new Error('Failed to initialize input editor');
    }

    // Initialize output editor using CodeMirrorManager
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
    this.elements.clearBtn.addEventListener('click', () => this.clearInput());
    this.elements.loadSampleBtn.addEventListener('click', () => this.loadSample());
    this.elements.parseStringToggle.addEventListener('change', () => this.handleParseStringToggle());
    this.elements.copyToInputBtn.addEventListener('click', () => this.copyToInput());
    this.elements.copyBtn.addEventListener('click', () => this.copyOutput());
    this.elements.downloadBtn.addEventListener('click', () => this.downloadOutput());
    
    // Format radio buttons - format output content
    this.elements.formatRadios.forEach(radio => {
      radio.addEventListener('change', () => this.handleFormatChange());
    });

    // Make error status expandable
    this.elements.inputStatus.addEventListener('click', (e) => {
      if (this.elements.inputStatus.classList.contains('error')) {
        e.stopPropagation();
        this.toggleErrorExpansion(this.elements.inputStatus);
      }
    });
  }

  private handleParseStringToggle(): void {
    // Re-validate input with new toggle state
    const input = this.inputEditor.getValue().trim();
    if (input) {
      this.validateInput();
      
      // If validation was successful and toggle is ON, display the parsed result
      if (this.elements.parseStringToggle.checked && this.lastValidJSON) {
        const formatted = JSON.stringify(this.lastValidJSON, null, 2);
        this.displayOutput(formatted, 'application/json');
        this.currentOutputType = 'json';
        this.showStatus(this.elements.outputStatus, 'JSON string parsed', 'success');
      } else if (!this.elements.parseStringToggle.checked && this.lastValidJSON) {
        // Toggle is OFF, display normal pretty print
        const formatted = JSON.stringify(this.lastValidJSON, null, 2);
        this.displayOutput(formatted, 'application/json');
        this.currentOutputType = 'json';
        this.showStatus(this.elements.outputStatus, 'Pretty printed', 'success');
      }
    }
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
    this.clearStatus();
  }

  private loadSample(): void {
    const sampleJSON = {
      "name": "John Doe",
      "age": 30,
      "city": "New York",
      "hobbies": ["reading", "swimming", "coding"],
      "address": {
        "street": "123 Main St",
        "zipCode": "10001"
      },
      "isActive": true,
      "balance": 1250.50,
      "spouse": null
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
      return;
    }

    // If Parse String toggle is ON, treat input as escaped JSON string
    if (this.elements.parseStringToggle.checked) {
      this.parseJSONStringForValidation(input);
      return;
    }

    try {
      this.lastValidJSON = JSON.parse(input);
      this.showStatus(this.elements.inputStatus, 'Valid JSON', 'success');
      // Apply current format to output
      this.applyCurrentFormat();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Always attempt auto-fix
      this.attemptAutoFix(input, errorMessage);
    }
  }

  private parseJSONStringForValidation(input: string): void {
    try {
      // Parse the escaped string
      const jsonString = JSON.parse(input);
      
      if (typeof jsonString !== 'string') {
        this.showStatus(this.elements.inputStatus, 'Input must be a JSON string', 'error');
        this.lastValidJSON = null;
        return;
      }

      // Parse the actual JSON
      const parsed = JSON.parse(jsonString);
      this.lastValidJSON = parsed;
      this.showStatus(this.elements.inputStatus, 'Valid JSON string', 'success');
      // Apply current format to output
      this.applyCurrentFormat();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.inputStatus, `Invalid JSON string: ${errorMessage}`, 'error');
      this.lastValidJSON = null;
    }
  }

  private attemptAutoFix(input: string, originalError: string): void {
    try {
      // Try custom repair first
      const customFixed = this.customJSONRepair(input);
      const parsed = JSON.parse(customFixed);
      
      // Store the valid JSON for format operations
      this.lastValidJSON = parsed;
      
      // Apply current format to output
      this.applyCurrentFormat();
      this.showStatus(this.elements.inputStatus, `Fixed: ${originalError}`, 'info');
      this.showStatus(this.elements.outputStatus, 'Fixed JSON displayed', 'success');
    } catch (customError) {
      // Try jsonrepair library
      try {
        const fixed = jsonrepair(input);
        const parsed = JSON.parse(fixed);
        
        // Store the valid JSON for format operations
        this.lastValidJSON = parsed;
        
        // Apply current format to output
        this.applyCurrentFormat();
        this.showStatus(this.elements.inputStatus, `Fixed: ${originalError}`, 'info');
        this.showStatus(this.elements.outputStatus, 'Fixed JSON displayed', 'success');
      } catch (fixError) {
        // Could not auto-fix, show original error
        this.lastValidJSON = null;
        this.showStatus(this.elements.inputStatus, `Invalid JSON: ${originalError}`, 'error');
      }
    }
  }

  private handleFormatChange(): void {
    this.applyCurrentFormat();
  }

  private applyCurrentFormat(): void {
    // Use stored valid JSON (always the original parsed version)
    if (!this.lastValidJSON) {
      return;
    }

    const selectedFormat = Array.from(this.elements.formatRadios).find(radio => radio.checked)?.value;
    
    // Apply the selected format to the stored valid JSON
    if (selectedFormat === 'pretty') {
      const formatted = JSON.stringify(this.lastValidJSON, null, 2);
      this.displayOutput(formatted, 'application/json');
      this.currentOutputType = 'json';
      this.showStatus(this.elements.outputStatus, 'Formatted as Pretty', 'success');
    } else if (selectedFormat === 'minify') {
      const minified = JSON.stringify(this.lastValidJSON);
      this.displayOutput(minified, 'application/json');
      this.currentOutputType = 'json';
      this.showStatus(this.elements.outputStatus, 'Minified successfully', 'success');
    } else if (selectedFormat === 'stringify') {
      const stringified = JSON.stringify(this.lastValidJSON);
      const escapedString = JSON.stringify(stringified);
      this.displayOutput(escapedString, 'text/plain');
      this.currentOutputType = 'text';
      this.showStatus(this.elements.outputStatus, 'Stringified successfully', 'success');
    }
  }


  private analyzeJSON(obj: any): string {
    const analysis: string[] = [];
    const type = Array.isArray(obj) ? 'Array' : typeof obj;
    analysis.push(`Type: ${type}`);
    
    if (Array.isArray(obj)) {
      analysis.push(`Length: ${obj.length} items`);
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      analysis.push(`Properties: ${keys.length}`);
      analysis.push(`Keys: ${keys.join(', ')}`);
    }
    
    analysis.push(`Size: ${JSON.stringify(obj).length} characters`);
    return analysis.join('\n');
  }

  private fixJSON(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter JSON data first', 'error');
      return;
    }

    try {
      // First try to parse as-is
      JSON.parse(input);
      this.showStatus(this.elements.outputStatus, 'JSON is already valid!', 'info');
      return;
    } catch (error) {
      // Try custom repair first for common patterns
      try {
        const customFixed = this.customJSONRepair(input);
        const parsed = JSON.parse(customFixed);
        const formatted = JSON.stringify(parsed, null, 2);
        this.displayOutput(formatted, 'application/json');
        this.currentOutputType = 'json';
        this.showStatus(this.elements.outputStatus, 'JSON fixed successfully! Please verify the result.', 'success');
        return;
      } catch (customError) {
        // If custom repair fails, try jsonrepair library
        try {
          const fixed = jsonrepair(input);
          const parsed = JSON.parse(fixed);
          const formatted = JSON.stringify(parsed, null, 2);
          this.displayOutput(formatted, 'application/json');
          this.currentOutputType = 'json';
          this.showStatus(this.elements.outputStatus, 'JSON fixed successfully! Please verify the result.', 'success');
        } catch (fixError) {
          const errorMessage = fixError instanceof Error ? fixError.message : 'Unknown error';
          this.showStatus(this.elements.outputStatus, `Could not auto-fix JSON: ${errorMessage}`, 'error');
        }
      }
    }
  }

  private stringifyJSON(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter JSON data first', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const stringified = JSON.stringify(parsed);
      // Escape the stringified JSON for display as a string
      const escapedString = JSON.stringify(stringified);
      this.displayOutput(escapedString, 'text/plain');
      this.currentOutputType = 'text';
      this.showStatus(this.elements.outputStatus, 'JSON converted to string successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.outputStatus, `Error stringifying JSON: ${errorMessage}`, 'error');
    }
  }

  private parseJSONString(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter a JSON string first', 'error');
      return;
    }

    try {
      // First try to parse the input as-is
      const jsonString = JSON.parse(input);
      
      if (typeof jsonString !== 'string') {
        this.showStatus(this.elements.outputStatus, 'Input must be a JSON string (quoted string containing JSON)', 'error');
        return;
      }

      // Then parse the JSON string content
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      this.displayOutput(formatted, 'application/json');
      this.currentOutputType = 'json';
      this.showStatus(this.elements.outputStatus, 'JSON string parsed successfully', 'success');
    } catch (error) {
      // If parsing the input fails, try to repair the input first
      try {
        const repairedInput = jsonrepair(input);
        const jsonString = JSON.parse(repairedInput);
        
        if (typeof jsonString !== 'string') {
          this.showStatus(this.elements.outputStatus, 'Input must be a JSON string (quoted string containing JSON)', 'error');
          return;
        }

        // Then parse the JSON string content
        const parsed = JSON.parse(jsonString);
        const formatted = JSON.stringify(parsed, null, 2);
        this.displayOutput(formatted, 'application/json');
        this.currentOutputType = 'json';
        this.showStatus(this.elements.outputStatus, 'Input repaired and JSON string parsed successfully! Please verify the result.', 'success');
      } catch (repairError) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.showStatus(this.elements.outputStatus, `Error parsing JSON string: ${errorMessage}`, 'error');
      }
    }
  }

  public inferSchema(): void {
    if (!this.lastValidJSON) {
      this.showStatus(this.elements.outputStatus, 'Please enter valid JSON first', 'error');
      return;
    }

    try {
      const inferrer = new JSONSchemaInferrer();
      const schema = inferrer.inferSchema(this.lastValidJSON);
      const formatted = inferrer.formatSchema(schema);
      
      this.displayOutput(formatted, 'application/json');
      this.currentOutputType = 'json';
      this.showStatus(this.elements.outputStatus, 'Schema inferred successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.outputStatus, `Error inferring schema: ${errorMessage}`, 'error');
    }
  }

  private customJSONRepair(input: string): string {
    let fixed = input;

    // Fix the specific pattern: missing quote and comma
    // Pattern: "key": "value "nextkey" -> "key": "value", "nextkey"
    fixed = fixed.replace(/("[\w\s]+"):\s*"([^"]*?)\s+"([^"]+"):/g, '$1: "$2", "$3":');
    
    // Fix missing closing quotes followed by property names
    // Pattern: "name": "John Doe "age" -> "name": "John Doe", "age"
    fixed = fixed.replace(/("[\w\s]+"):\s*"([^"]*?)\s+("[\w\s]+"):/g, '$1: "$2", $3:');

    // Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');

    // Fix missing quotes around property names
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

    // Fix trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // Fix missing commas between properties (when properly quoted)
    fixed = fixed.replace(/("\s*)\s+("[\w\s]+"):/g, '$1, $2:');

    return fixed;
  }

  private copyToInput(): void {
    const outputText = this.outputEditor.getValue();
    if (!outputText) {
      this.showStatus(this.elements.outputStatus, 'No output to copy', 'error');
      return;
    }

    this.inputEditor.setValue(outputText);
    this.validateInput();
    this.showStatus(this.elements.outputStatus, 'Output copied to input!', 'success');
  }

  private async copyOutput(): Promise<void> {
    const outputText = this.outputEditor.getValue();
    if (!outputText) {
      this.showStatus(this.elements.outputStatus, 'No output to copy', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      this.showStatus(this.elements.outputStatus, 'Output copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = outputText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showStatus(this.elements.outputStatus, 'Output copied to clipboard!', 'success');
    }
  }

  private downloadOutput(): void {
    const outputText = this.outputEditor.getValue();
    if (!outputText) {
      this.showStatus(this.elements.outputStatus, 'No output to download', 'error');
      return;
    }

    const extensions: Record<OutputType, string> = {
      'json': 'json',
      'text': 'txt'
    };

    const extension = extensions[this.currentOutputType] || 'txt';
    const filename = `output.${extension}`;
    
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showStatus(this.elements.outputStatus, `File downloaded as ${filename}`, 'success');
  }

  private showStatus(element: HTMLElement, message: string, type: StatusType): void {
    element.innerHTML = '';
    element.className = `status-inline ${type}`;
    
    // Add collapsed class for errors by default
    if (type === 'error') {
      element.classList.add('collapsed');
    }
    
    const contentSpan = document.createElement('span');
    contentSpan.className = 'error-content';
    contentSpan.textContent = message;
    element.appendChild(contentSpan);
  }

  private toggleErrorExpansion(element: HTMLElement): void {
    if (element.classList.contains('collapsed')) {
      element.classList.remove('collapsed');
      element.classList.add('expanded');
    } else if (element.classList.contains('expanded')) {
      element.classList.remove('expanded');
      element.classList.add('collapsed');
    }
  }

  private clearStatus(): void {
    this.elements.inputStatus.textContent = '';
    this.elements.inputStatus.className = 'status-inline';
    this.elements.outputStatus.textContent = '';
    this.elements.outputStatus.className = 'status-inline';
  }

  private displayOutput(content: string, mode: string): void {
    this.outputEditor.setValue(content);
    this.outputEditor.setOption('mode', mode);
  }
}
