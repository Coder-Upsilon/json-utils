import * as CodeMirror from 'codemirror';
import 'codemirror/addon/edit/matchbrackets';
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