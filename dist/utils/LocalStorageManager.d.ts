/**
 * LocalStorageManager - Handles persistent storage of editor content across pages
 * Automatically saves input content and restores it when navigating between pages
 */
export interface StorageConfig {
    key: string;
    autoSave?: boolean;
    debounceMs?: number;
}
export declare class LocalStorageManager {
    private config;
    private debounceTimer;
    private isEnabled;
    private syncEnabledListener;
    constructor(config: StorageConfig);
    /**
     * Get the actual storage key based on current settings
     */
    private getActualKey;
    /**
     * Check if localStorage is available and functional
     */
    private checkLocalStorageAvailable;
    /**
     * Save content to localStorage with debouncing
     */
    save(content: string): void;
    /**
     * Save content to localStorage immediately without debouncing
     */
    saveImmediate(content: string): void;
    /**
     * Load content from localStorage
     */
    load(): string | null;
    /**
     * Clear stored content
     */
    clear(): void;
    /**
     * Check if there is saved content available
     */
    hasSavedContent(): boolean;
    /**
     * Get the age of saved content in milliseconds
     */
    getContentAge(): number | null;
    /**
     * Enable or disable auto-save
     */
    setAutoSave(enabled: boolean): void;
    /**
     * Cleanup - clear any pending timers and event listeners
     */
    cleanup(): void;
    /**
     * Setup listener to save content when sync is enabled
     * Prevents duplicate listeners and ensures proper cleanup
     */
    setupSyncEnabledListener(getContent: () => string): void;
}
export declare const STORAGE_KEYS: {
    JSON_FORMATTER: string;
    JSON_FILTER: string;
    FORMAT_CONVERTER: string;
    SCHEMA_DETECTOR: string;
};
/**
 * Get the actual storage key - always returns shared key
 */
export declare function getStorageKey(pageKey: string): string;
/**
 * Get share across pages preference
 */
export declare function getShareAcrossPages(): boolean;
/**
 * Set share across pages preference
 */
export declare function setShareAcrossPages(enabled: boolean): void;
//# sourceMappingURL=LocalStorageManager.d.ts.map