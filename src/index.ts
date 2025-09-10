import './styles.css';
import { jsonrepair } from 'jsonrepair';
import * as CodeMirror from 'codemirror';

// Import CodeMirror modes
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/xml/xml';

// Import CodeMirror addons for code folding
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/comment-fold';

interface JSONUtilsElements {
  clearBtn: HTMLButtonElement;
  loadSampleBtn: HTMLButtonElement;
  formatBtn: HTMLButtonElement;
  minifyBtn: HTMLButtonElement;
  validateBtn: HTMLButtonElement;
  toYamlBtn: HTMLButtonElement;
  toXmlBtn: HTMLButtonElement;
  fixJsonBtn: HTMLButtonElement;
  stringifyBtn: HTMLButtonElement;
  parseBtn: HTMLButtonElement;
  copyToInputBtn: HTMLButtonElement;
  copyBtn: HTMLButtonElement;
  downloadBtn: HTMLButtonElement;
  inputStatus: HTMLElement;
  outputStatus: HTMLElement;
}

type OutputType = 'json' | 'yaml' | 'xml' | 'text';
type StatusType = 'success' | 'error' | 'info';

class JSONUtils {
  private elements!: JSONUtilsElements;
  private inputEditor!: CodeMirror.Editor;
  private outputEditor!: CodeMirror.Editor;
  private currentOutputType: OutputType = 'json';

  constructor() {
    this.initializeElements();
    this.initializeEditors();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.elements = {
      clearBtn: this.getElementById('clearBtn') as HTMLButtonElement,
      loadSampleBtn: this.getElementById('loadSampleBtn') as HTMLButtonElement,
      formatBtn: this.getElementById('formatBtn') as HTMLButtonElement,
      minifyBtn: this.getElementById('minifyBtn') as HTMLButtonElement,
      validateBtn: this.getElementById('validateBtn') as HTMLButtonElement,
      toYamlBtn: this.getElementById('toYamlBtn') as HTMLButtonElement,
      toXmlBtn: this.getElementById('toXmlBtn') as HTMLButtonElement,
      fixJsonBtn: this.getElementById('fixJsonBtn') as HTMLButtonElement,
      stringifyBtn: this.getElementById('stringifyBtn') as HTMLButtonElement,
      parseBtn: this.getElementById('parseBtn') as HTMLButtonElement,
      copyToInputBtn: this.getElementById('copyToInputBtn') as HTMLButtonElement,
      copyBtn: this.getElementById('copyBtn') as HTMLButtonElement,
      downloadBtn: this.getElementById('downloadBtn') as HTMLButtonElement,
      inputStatus: this.getElementById('inputStatus'),
      outputStatus: this.getElementById('outputStatus'),
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
    // Initialize input editor with CodeMirror
    const inputTextarea = this.getElementById('jsonInput') as HTMLTextAreaElement;
    this.inputEditor = CodeMirror.fromTextArea(inputTextarea, {
      mode: 'application/json',
      theme: 'material-darker',
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 2,
      tabSize: 2,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      extraKeys: {
        'Ctrl-Q': (cm: any) => cm.foldCode(cm.getCursor()),
        'Cmd-Q': (cm: any) => cm.foldCode(cm.getCursor())
      }
    } as any);

    // Initialize output editor with CodeMirror
    const outputTextarea = this.getElementById('output') as HTMLTextAreaElement;
    this.outputEditor = CodeMirror.fromTextArea(outputTextarea, {
      mode: 'application/json',
      theme: 'material-darker',
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      indentUnit: 2,
      tabSize: 2,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      extraKeys: {
        'Ctrl-Q': (cm: any) => cm.foldCode(cm.getCursor()),
        'Cmd-Q': (cm: any) => cm.foldCode(cm.getCursor())
      }
    } as any);

    // Set up real-time validation
    this.inputEditor.on('change', () => {
      this.debounce(() => this.validateInput(), 500)();
    });
  }

  private attachEventListeners(): void {
    this.elements.clearBtn.addEventListener('click', () => this.clearInput());
    this.elements.loadSampleBtn.addEventListener('click', () => this.loadSample());
    this.elements.formatBtn.addEventListener('click', () => this.formatJSON());
    this.elements.minifyBtn.addEventListener('click', () => this.minifyJSON());
    this.elements.validateBtn.addEventListener('click', () => this.validateJSON());
    this.elements.toYamlBtn.addEventListener('click', () => this.convertToYAML());
    this.elements.toXmlBtn.addEventListener('click', () => this.convertToXML());
    this.elements.fixJsonBtn.addEventListener('click', () => this.fixJSON());
    this.elements.stringifyBtn.addEventListener('click', () => this.stringifyJSON());
    this.elements.parseBtn.addEventListener('click', () => this.parseJSONString());
    this.elements.copyToInputBtn.addEventListener('click', () => this.copyToInput());
    this.elements.copyBtn.addEventListener('click', () => this.copyOutput());
    this.elements.downloadBtn.addEventListener('click', () => this.downloadOutput());
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
      return;
    }

    try {
      JSON.parse(input);
      this.showStatus(this.elements.inputStatus, 'Valid JSON', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.inputStatus, `Invalid JSON: ${errorMessage}`, 'error');
    }
  }

  private formatJSON(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter JSON data first', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      this.displayOutput(formatted, 'application/json');
      this.currentOutputType = 'json';
      this.showStatus(this.elements.outputStatus, 'JSON formatted successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.outputStatus, `Error formatting JSON: ${errorMessage}`, 'error');
    }
  }

  private minifyJSON(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter JSON data first', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      this.displayOutput(minified, 'application/json');
      this.currentOutputType = 'json';
      this.showStatus(this.elements.outputStatus, 'JSON minified successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.outputStatus, `Error minifying JSON: ${errorMessage}`, 'error');
    }
  }

  private validateJSON(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter JSON data first', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const analysis = this.analyzeJSON(parsed);
      this.displayOutput(`✅ Valid JSON!\n\n${analysis}`, 'text/plain');
      this.currentOutputType = 'text';
      this.showStatus(this.elements.outputStatus, 'JSON is valid', 'success');
    } catch (error) {
      const errorInfo = this.getDetailedError(error, input);
      this.displayOutput(`❌ Invalid JSON!\n\n${errorInfo}`, 'text/plain');
      this.currentOutputType = 'text';
      this.showStatus(this.elements.outputStatus, 'JSON validation failed', 'error');
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

  private getDetailedError(error: unknown, input: string): string {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const lines = input.split('\n');
    const errorInfo = [`Error: ${errorMessage}`];
    
    // Try to find line number from error message
    const lineMatch = errorMessage.match(/line (\d+)/i);
    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1]);
      errorInfo.push(`Line ${lineNum}: ${lines[lineNum - 1] || 'N/A'}`);
    }
    
    // Common JSON errors and suggestions
    if (errorMessage.includes('Unexpected token')) {
      errorInfo.push('\nCommon fixes:');
      errorInfo.push('• Check for missing commas between properties');
      errorInfo.push('• Ensure all strings are quoted with double quotes');
      errorInfo.push('• Remove trailing commas');
      errorInfo.push('• Check for unescaped quotes in strings');
    }
    
    return errorInfo.join('\n');
  }

  private convertToYAML(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter JSON data first', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const yaml = this.jsonToYAML(parsed);
      this.displayOutput(yaml, 'text/x-yaml');
      this.currentOutputType = 'yaml';
      this.showStatus(this.elements.outputStatus, 'Converted to YAML successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.outputStatus, `Error converting to YAML: ${errorMessage}`, 'error');
    }
  }

  private jsonToYAML(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') {
      // Escape special characters and quote if necessary
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.includes('[') || obj.includes(']')) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => `${spaces}- ${this.jsonToYAML(item, indent + 1).replace(/^\s+/, '')}`).join('\n');
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}';
      
      return keys.map(key => {
        const value = obj[key];
        const yamlValue = this.jsonToYAML(value, indent + 1);
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return `${spaces}${key}:\n${yamlValue}`;
        } else if (Array.isArray(value) && value.length > 0) {
          return `${spaces}${key}:\n${yamlValue}`;
        } else {
          return `${spaces}${key}: ${yamlValue}`;
        }
      }).join('\n');
    }
    
    return obj.toString();
  }

  private convertToXML(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter JSON data first', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const xml = this.jsonToXML(parsed);
      const fullXml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${xml}\n</root>`;
      this.displayOutput(fullXml, 'application/xml');
      this.currentOutputType = 'xml';
      this.showStatus(this.elements.outputStatus, 'Converted to XML successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.outputStatus, `Error converting to XML: ${errorMessage}`, 'error');
    }
  }

  private jsonToXML(obj: any, indent = 1): string {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return `${spaces}<null/>`;
    if (typeof obj === 'boolean') return `${spaces}<boolean>${obj}</boolean>`;
    if (typeof obj === 'number') return `${spaces}<number>${obj}</number>`;
    if (typeof obj === 'string') return `${spaces}<string>${this.escapeXML(obj)}</string>`;
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        `${spaces}<item index="${index}">\n${this.jsonToXML(item, indent + 1)}\n${spaces}</item>`
      ).join('\n');
    }
    
    if (typeof obj === 'object') {
      return Object.keys(obj).map(key => {
        const value = obj[key];
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        
        if (typeof value === 'object' && value !== null) {
          return `${spaces}<${sanitizedKey}>\n${this.jsonToXML(value, indent + 1)}\n${spaces}</${sanitizedKey}>`;
        } else {
          return `${spaces}<${sanitizedKey}>${this.escapeXML(String(value))}</${sanitizedKey}>`;
        }
      }).join('\n');
    }
    
    return `${spaces}<value>${this.escapeXML(String(obj))}</value>`;
  }

  private escapeXML(str: string): string {
    return str.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return char;
      }
    });
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
      'yaml': 'yaml',
      'xml': 'xml',
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
    element.textContent = message;
    element.className = `status-inline ${type}`;
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JSONUtils();
});
