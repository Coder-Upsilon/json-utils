// Import only the core CodeMirror functionality
import * as CodeMirror from 'codemirror';

// Import only required modes
import 'codemirror/mode/javascript/javascript';

// Import only required addons
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';

// Import search addons
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/scroll/annotatescrollbar';

// Import only required themes and CSS
import 'codemirror/theme/material-darker.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';

export interface CodeMirrorConfig {
  mode?: string;
  theme?: string;
  lineNumbers?: boolean;
  lineWrapping?: boolean;
  readOnly?: boolean;
  indentUnit?: number;
  tabSize?: number;
  foldGutter?: boolean;
  gutters?: string[];
  extraKeys?: any;
  matchBrackets?: boolean;
  highlightSelectionMatches?: boolean | { showToken?: RegExp | boolean; annotateScrollbar?: boolean; minChars?: number };
}

export class CodeMirrorManager {
  private static instances = new Map<string, CodeMirror.Editor>();

  /**
   * Safely initialize CodeMirror on a textarea, preventing duplicate instances
   */
  static initializeEditor(
    textareaId: string, 
    config: CodeMirrorConfig = {}
  ): CodeMirror.Editor | null {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    
    if (!textarea) {
      console.error(`Textarea with id "${textareaId}" not found`);
      return null;
    }

    // Check if CodeMirror is already initialized on this textarea
    if ((textarea as any).CodeMirror) {
      console.warn(`CodeMirror already initialized on textarea "${textareaId}", returning existing instance`);
      const existingEditor = (textarea as any).CodeMirror;
      this.instances.set(textareaId, existingEditor);
      return existingEditor;
    }

    // Check if we already have an instance for this textarea ID
    const existingInstance = this.instances.get(textareaId);
    if (existingInstance) {
      console.warn(`CodeMirror instance already exists for "${textareaId}", returning existing instance`);
      return existingInstance;
    }

    try {
      // Default configuration
      const defaultConfig: CodeMirrorConfig = {
        mode: 'application/json',
        theme: 'material-darker',
        lineNumbers: true,
        lineWrapping: true,
        readOnly: false, // Explicitly set to false by default
        indentUnit: 2,
        tabSize: 2,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        matchBrackets: true, // Enable bracket matching
        highlightSelectionMatches: {
          showToken: /\w/, // Highlight whole words when selected
          annotateScrollbar: true, // Show matches on scrollbar
          minChars: 2 // Minimum characters to trigger highlighting
        },
        extraKeys: {
          'Ctrl-Q': (cm: any) => cm.foldCode(cm.getCursor()),
          'Cmd-Q': (cm: any) => cm.foldCode(cm.getCursor()),
          'Alt-G': 'jumpToLine' // Jump to line with Alt-G
        }
      };

      // Merge with provided config
      const finalConfig = { ...defaultConfig, ...config };

      // Initialize CodeMirror
      const editor = CodeMirror.fromTextArea(textarea, finalConfig as any);
      
      // Store the instance
      this.instances.set(textareaId, editor);
      
      return editor;
    } catch (error) {
      console.error(`Failed to initialize CodeMirror on textarea "${textareaId}":`, error);
      return null;
    }
  }

  /**
   * Get an existing CodeMirror instance by textarea ID
   */
  static getInstance(textareaId: string): CodeMirror.Editor | null {
    return this.instances.get(textareaId) || null;
  }

  /**
   * Cleanup a CodeMirror instance
   */
  static cleanup(textareaId: string): void {
    const editor = this.instances.get(textareaId);
    if (editor) {
      try {
        (editor as any).toTextArea();
        this.instances.delete(textareaId);
      } catch (error) {
        console.error(`Error cleaning up CodeMirror instance for "${textareaId}":`, error);
      }
    }
  }

  /**
   * Cleanup all CodeMirror instances
   */
  static cleanupAll(): void {
    for (const [textareaId] of this.instances) {
      this.cleanup(textareaId);
    }
  }

  /**
   * Check if a textarea has CodeMirror initialized
   */
  static hasInstance(textareaId: string): boolean {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    return !!(textarea && (textarea as any).CodeMirror) || this.instances.has(textareaId);
  }
}
