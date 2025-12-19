export declare class JSONUtils {
    private elements;
    private inputEditor;
    private outputEditor;
    private currentOutputType;
    private lastValidJSON;
    private storageManager;
    constructor();
    private initializeElements;
    private getElementById;
    private getElementBySelector;
    private initializeEditors;
    private attachEventListeners;
    private handleParseStringToggle;
    private debounce;
    private clearInput;
    private loadSample;
    private validateInput;
    private parseJSONStringForValidation;
    private attemptAutoFix;
    private handleFormatChange;
    private applyCurrentFormat;
    private analyzeJSON;
    private fixJSON;
    private stringifyJSON;
    private parseJSONString;
    inferSchema(): void;
    private customJSONRepair;
    private copyToInput;
    private copyOutput;
    private downloadOutput;
    private showStatus;
    private toggleErrorExpansion;
    private clearStatus;
    private displayOutput;
    /**
     * Load saved content from localStorage on page load
     */
    private loadSavedContent;
    /**
     * Listen for syncEnabled event and save current content
     */
    private setupSyncEnabledListener;
}
//# sourceMappingURL=JSONUtils.d.ts.map