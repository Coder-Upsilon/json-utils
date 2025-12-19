import { jsonrepair } from 'jsonrepair';
import { CodeMirrorManager } from './CodeMirrorManager';
import { LocalStorageManager, STORAGE_KEYS } from './LocalStorageManager';
import { 
  trackFormatConversion, 
  trackCopy, 
  trackDownload, 
  trackButtonClick,
  trackError,
  EventName 
} from './Analytics';
import type * as CodeMirror from 'codemirror';

interface FormatConverterElements {
  clearBtn: HTMLButtonElement;
  loadSampleBtn: HTMLButtonElement;
  inputFormat: HTMLSelectElement;
  outputFormat: HTMLSelectElement;
  copyToInputBtn: HTMLButtonElement;
  copyBtn: HTMLButtonElement;
  downloadBtn: HTMLButtonElement;
  inputStatus: HTMLElement;
  outputStatus: HTMLElement;
}

type FormatType = 'json' | 'yaml' | 'xml' | 'csv';
type StatusType = 'success' | 'error' | 'info';

export class FormatConverter {
  private elements!: FormatConverterElements;
  private inputEditor!: CodeMirror.Editor;
  private outputEditor!: CodeMirror.Editor;
  private parsedData: any = null;
  private storageManager: LocalStorageManager;

  constructor() {
    this.storageManager = new LocalStorageManager({
      key: STORAGE_KEYS.FORMAT_CONVERTER,
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
      clearBtn: this.getElementById('clearBtn') as HTMLButtonElement,
      loadSampleBtn: this.getElementById('loadSampleBtn') as HTMLButtonElement,
      inputFormat: this.getElementById('inputFormat') as HTMLSelectElement,
      outputFormat: this.getElementById('outputFormat') as HTMLSelectElement,
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
    const inputEditor = CodeMirrorManager.initializeEditor('jsonInput', {
      mode: 'application/json',
      readOnly: false
    });
    
    if (inputEditor) {
      this.inputEditor = inputEditor;
      this.inputEditor.setOption('readOnly', false);
      
      // Set up auto-save on input change
      this.inputEditor.on('change', () => {
        const content = this.inputEditor.getValue();
        this.storageManager.save(content);
      });
    } else {
      throw new Error('Failed to initialize input editor');
    }

    const outputEditor = CodeMirrorManager.initializeEditor('output', {
      mode: 'text/x-yaml',
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
    this.elements.copyToInputBtn.addEventListener('click', () => this.copyToInput());
    this.elements.copyBtn.addEventListener('click', () => this.copyOutput());
    this.elements.downloadBtn.addEventListener('click', () => this.downloadOutput());
    
    // Update CodeMirror mode when format changes
    this.elements.inputFormat.addEventListener('change', () => {
      this.updateInputMode();
      this.autoConvert();
    });
    this.elements.outputFormat.addEventListener('change', () => {
      this.updateOutputMode();
      this.autoConvert();
    });

    // Auto-convert on input change (auto-save is now in initializeEditors)
    this.inputEditor.on('change', () => {
      this.debounce(() => this.autoConvert(), 800)();
    });

    // Make error status expandable
    this.elements.inputStatus.addEventListener('click', (e) => {
      if (this.elements.inputStatus.classList.contains('error')) {
        e.stopPropagation();
        this.toggleErrorExpansion(this.elements.inputStatus);
      }
    });
  }

  private updateInputMode(): void {
    const format = this.elements.inputFormat.value as FormatType;
    const modeMap = {
      json: 'application/json',
      xml: 'application/xml',
      yaml: 'text/x-yaml',
      csv: 'text/plain'
    };
    this.inputEditor.setOption('mode', modeMap[format]);
  }

  private updateOutputMode(): void {
    const format = this.elements.outputFormat.value as FormatType;
    const modeMap = {
      json: 'application/json',
      xml: 'application/xml',
      yaml: 'text/x-yaml',
      csv: 'text/plain'
    };
    this.outputEditor.setOption('mode', modeMap[format]);
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
    this.parsedData = null;
  }

  private loadSample(): void {
    trackButtonClick('loadSampleBtn', 'Load Sample');
    const sampleJSON = {
      "name": "John Doe",
      "age": 30,
      "city": "New York",
      "hobbies": ["reading", "swimming", "coding"],
      "address": {
        "street": "123 Main St",
        "zipCode": "10001"
      }
    };
    const formatted = JSON.stringify(sampleJSON, null, 2);
    this.inputEditor.setValue(formatted);
    this.elements.inputFormat.value = 'json';
    this.updateInputMode();
  }

  private autoConvert(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.outputEditor.setValue('');
      this.clearStatus();
      return;
    }
    this.convert();
  }

  private convert(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.showStatus(this.elements.outputStatus, 'Please enter data first', 'error');
      return;
    }

    const inputFormat = this.elements.inputFormat.value as FormatType;
    const outputFormat = this.elements.outputFormat.value as FormatType;

    try {
      // Step 1: Parse input based on input format
      this.parsedData = this.parseInput(input, inputFormat);
      this.showStatus(this.elements.inputStatus, `${inputFormat.toUpperCase()} parsed successfully`, 'success');

      // Step 2: Convert to output format
      const output = this.formatOutput(this.parsedData, outputFormat);
      this.displayOutput(output);
      this.showStatus(this.elements.outputStatus, `Converted to ${outputFormat.toUpperCase()} successfully`, 'success');
      trackFormatConversion(inputFormat, outputFormat, true, input.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(this.elements.inputStatus, `Error: ${errorMessage}`, 'error');
      this.parsedData = null;
      trackError(EventName.CONVERSION_ERROR, errorMessage, `${inputFormat}_to_${outputFormat}`);
    }
  }

  private parseInput(input: string, format: FormatType): any {
    switch (format) {
      case 'json':
        return this.parseJSON(input);
      case 'xml':
        return this.parseXML(input);
      case 'yaml':
        return this.parseYAML(input);
      case 'csv':
        return this.parseCSV(input);
      default:
        throw new Error(`Unsupported input format: ${format}`);
    }
  }

  private parseJSON(input: string): any {
    try {
      return JSON.parse(input);
    } catch (error) {
      // Try to repair and parse again
      const fixed = jsonrepair(input);
      return JSON.parse(fixed);
    }
  }

  private parseXML(input: string): any {
    // Simple XML to JSON parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML');
    }
    
    return this.xmlToJson(xmlDoc.documentElement);
  }

  private xmlToJson(xml: Element): any {
    const obj: any = {};
    
    // Handle attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let i = 0; i < xml.attributes.length; i++) {
        const attr = xml.attributes[i];
        obj['@attributes'][attr.nodeName] = attr.nodeValue;
      }
    }
    
    // Handle children
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const child = xml.childNodes[i];
        const nodeName = child.nodeName;
        
        if (child.nodeType === 3) { // Text node
          const text = child.nodeValue?.trim();
          if (text) {
            return text;
          }
        } else if (child.nodeType === 1) { // Element node
          if (typeof obj[nodeName] === 'undefined') {
            obj[nodeName] = this.xmlToJson(child as Element);
          } else {
            if (!Array.isArray(obj[nodeName])) {
              obj[nodeName] = [obj[nodeName]];
            }
            obj[nodeName].push(this.xmlToJson(child as Element));
          }
        }
      }
    }
    
    return obj;
  }

  private parseYAML(input: string): any {
    // Basic YAML parser (handles simple cases)
    const lines = input.split('\n');
    const result: any = {};
    const stack: any[] = [result];
    const indentStack: number[] = [0];
    
    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('#')) continue;
      
      const indent = line.search(/\S/);
      const content = line.trim();
      
      // Handle list items
      if (content.startsWith('- ')) {
        const value = content.substring(2).trim();
        const parent = stack[stack.length - 1];
        
        if (!Array.isArray(parent)) {
          throw new Error('Invalid YAML: list item without array context');
        }
        
        if (value.includes(':')) {
          const obj: any = {};
          const [key, val] = value.split(':').map(s => s.trim());
          obj[key] = this.parseYAMLValue(val);
          parent.push(obj);
        } else {
          parent.push(this.parseYAMLValue(value));
        }
        continue;
      }
      
      // Handle key-value pairs
      if (content.includes(':')) {
        const [key, ...valueParts] = content.split(':');
        const value = valueParts.join(':').trim();
        
        // Adjust stack based on indentation
        while (indent < indentStack[indentStack.length - 1] && stack.length > 1) {
          stack.pop();
          indentStack.pop();
        }
        
        const parent = stack[stack.length - 1];
        
        if (value === '' || value === '[]' || value === '{}') {
          // Empty value or object/array indicator
          if (value === '[]') {
            parent[key.trim()] = [];
          } else {
            parent[key.trim()] = {};
          }
          stack.push(parent[key.trim()]);
          indentStack.push(indent);
        } else {
          parent[key.trim()] = this.parseYAMLValue(value);
        }
      }
    }
    
    return result;
  }

  private parseYAMLValue(value: string): any {
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }

  private parseCSV(input: string): any[] {
    const lines = input.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('Empty CSV');
    }
    
    const headers = this.parseCSVLine(lines[0]);
    const result: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const obj: any = {};
      
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j] || '';
      }
      
      result.push(obj);
    }
    
    return result;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private formatOutput(data: any, format: FormatType): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'xml':
        return this.jsonToXML(data);
      case 'yaml':
        return this.jsonToYAML(data);
      case 'csv':
        return this.jsonToCSV(data);
      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
  }

  private jsonToYAML(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') {
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

  private jsonToXML(obj: any, rootName = 'root', indent = 0): string {
    if (indent === 0) {
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${this.jsonToXML(obj, rootName, 1)}\n</${rootName}>`;
    }
    
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return `${spaces}<null/>`;
    if (typeof obj === 'boolean') return `${spaces}<boolean>${obj}</boolean>`;
    if (typeof obj === 'number') return `${spaces}<number>${obj}</number>`;
    if (typeof obj === 'string') return `${spaces}<string>${this.escapeXML(obj)}</string>`;
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        `${spaces}<item index="${index}">\n${this.jsonToXML(item, 'item', indent + 1)}\n${spaces}</item>`
      ).join('\n');
    }
    
    if (typeof obj === 'object') {
      return Object.keys(obj).map(key => {
        const value = obj[key];
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        
        if (typeof value === 'object' && value !== null) {
          return `${spaces}<${sanitizedKey}>\n${this.jsonToXML(value, sanitizedKey, indent + 1)}\n${spaces}</${sanitizedKey}>`;
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

  private jsonToCSV(data: any): string {
    if (!Array.isArray(data)) {
      throw new Error('CSV output requires an array of objects');
    }
    
    if (data.length === 0) {
      return '';
    }
    
    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });
    
    const headers = Array.from(allKeys);
    
    // Create header row
    const headerRow = headers.map(h => this.escapeCSV(h)).join(',');
    
    // Create data rows
    const dataRows = data.map(item => {
      return headers.map(key => {
        const value = item[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return this.escapeCSV(JSON.stringify(value));
        return this.escapeCSV(String(value));
      }).join(',');
    });
    
    return [headerRow, ...dataRows].join('\n');
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private copyToInput(): void {
    const outputText = this.outputEditor.getValue();
    if (!outputText) {
      this.showStatus(this.elements.outputStatus, 'No output to copy', 'error');
      return;
    }

    this.inputEditor.setValue(outputText);
    // Swap formats
    const outputFormat = this.elements.outputFormat.value;
    this.elements.inputFormat.value = outputFormat;
    this.updateInputMode();
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
      trackCopy(this.elements.outputFormat.value, outputText.length);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = outputText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showStatus(this.elements.outputStatus, 'Output copied to clipboard!', 'success');
      trackCopy(this.elements.outputFormat.value, outputText.length);
    }
  }

  private downloadOutput(): void {
    const outputText = this.outputEditor.getValue();
    if (!outputText) {
      this.showStatus(this.elements.outputStatus, 'No output to download', 'error');
      return;
    }

    const format = this.elements.outputFormat.value;
    const filename = `output.${format}`;
    
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
    trackDownload(format, outputText.length);
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

  private displayOutput(content: string): void {
    this.outputEditor.setValue(content);
  }

  /**
   * Load saved content from localStorage on page load
   */
  private loadSavedContent(): void {
    const savedContent = this.storageManager.load();
    if (savedContent && savedContent.trim()) {
      this.inputEditor.setValue(savedContent);
      // Trigger conversion after loading
      this.autoConvert();
    }
  }
}
