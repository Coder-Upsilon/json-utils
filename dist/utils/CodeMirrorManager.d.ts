import * as CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/scroll/annotatescrollbar';
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
    highlightSelectionMatches?: boolean | {
        showToken?: RegExp | boolean;
        annotateScrollbar?: boolean;
        minChars?: number;
    };
}
export declare class CodeMirrorManager {
    private static instances;
    /**
     * Safely initialize CodeMirror on a textarea, preventing duplicate instances
     */
    static initializeEditor(textareaId: string, config?: CodeMirrorConfig): CodeMirror.Editor | null;
    /**
     * Get an existing CodeMirror instance by textarea ID
     */
    static getInstance(textareaId: string): CodeMirror.Editor | null;
    /**
     * Cleanup a CodeMirror instance
     */
    static cleanup(textareaId: string): void;
    /**
     * Cleanup all CodeMirror instances
     */
    static cleanupAll(): void;
    /**
     * Check if a textarea has CodeMirror initialized
     */
    static hasInstance(textareaId: string): boolean;
}
//# sourceMappingURL=CodeMirrorManager.d.ts.map