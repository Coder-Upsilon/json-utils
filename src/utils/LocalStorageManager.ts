/**
 * LocalStorageManager - Handles persistent storage of editor content across pages
 * Automatically saves input content and restores it when navigating between pages
 */

export interface StorageConfig {
  key: string;
  autoSave?: boolean;
  debounceMs?: number;
}

export class LocalStorageManager {
  private config: StorageConfig;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isEnabled: boolean = true;
  private syncEnabledListener: ((event: Event) => void) | null = null;

  constructor(config: StorageConfig) {
    this.config = {
      autoSave: true,
      debounceMs: 500,
      ...config
    };
    
    // Check if localStorage is available
    this.isEnabled = this.checkLocalStorageAvailable();
  }

  /**
   * Get the actual storage key based on current settings
   */
  private getActualKey(): string {
    return getStorageKey(this.config.key);
  }

  /**
   * Check if localStorage is available and functional
   */
  private checkLocalStorageAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Save content to localStorage with debouncing
   */
  public save(content: string): void {
    if (!this.isEnabled || !this.config.autoSave) {
      return;
    }

    // Don't save if sync is disabled
    if (!getShareAcrossPages()) {
      return;
    }

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounced save
    this.debounceTimer = setTimeout(() => {
      this.saveImmediate(content);
    }, this.config.debounceMs);
  }

  /**
   * Save content to localStorage immediately without debouncing
   */
  public saveImmediate(content: string): void {
    if (!this.isEnabled) {
      return;
    }

    // Don't save if sync is disabled
    if (!getShareAcrossPages()) {
      return;
    }

    try {
      const data = {
        content,
        timestamp: Date.now()
      };
      localStorage.setItem(this.getActualKey(), JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  /**
   * Load content from localStorage
   */
  public load(): string | null {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const item = localStorage.getItem(this.getActualKey());
      if (!item) {
        return null;
      }

      const data = JSON.parse(item);
      
      // Optional: Check if data is too old (e.g., older than 7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (data.timestamp && (Date.now() - data.timestamp > maxAge)) {
        this.clear();
        return null;
      }

      return data.content || null;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return null;
    }
  }

  /**
   * Clear stored content
   */
  public clear(): void {
    if (!this.isEnabled) {
      return;
    }

    try {
      localStorage.removeItem(this.getActualKey());
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
  }

  /**
   * Check if there is saved content available
   */
  public hasSavedContent(): boolean {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const item = localStorage.getItem(this.getActualKey());
      return item !== null && item.length > 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the age of saved content in milliseconds
   */
  public getContentAge(): number | null {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const item = localStorage.getItem(this.getActualKey());
      if (!item) {
        return null;
      }

      const data = JSON.parse(item);
      if (!data.timestamp) {
        return null;
      }

      return Date.now() - data.timestamp;
    } catch (e) {
      return null;
    }
  }

  /**
   * Enable or disable auto-save
   */
  public setAutoSave(enabled: boolean): void {
    this.config.autoSave = enabled;
  }

  /**
   * Cleanup - clear any pending timers and event listeners
   */
  public cleanup(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    // Remove event listener if it exists
    if (this.syncEnabledListener) {
      window.removeEventListener('syncEnabled', this.syncEnabledListener);
      this.syncEnabledListener = null;
    }
  }

  /**
   * Setup listener to save content when sync is enabled
   * Prevents duplicate listeners and ensures proper cleanup
   */
  public setupSyncEnabledListener(getContent: () => string): void {
    // Remove existing listener if any
    if (this.syncEnabledListener) {
      window.removeEventListener('syncEnabled', this.syncEnabledListener);
    }
    
    // Create and store new listener
    this.syncEnabledListener = () => {
      const content = getContent();
      // Only save if there's actual content
      if (content && content.trim()) {
        this.saveImmediate(content);
      }
    };
    
    window.addEventListener('syncEnabled', this.syncEnabledListener);
  }
}

/**
 * Storage key - always uses shared input across all pages
 */
const SHARED_KEY = 'json_utils_shared_input';

export const STORAGE_KEYS = {
  JSON_FORMATTER: 'JSON_FORMATTER',
  JSON_FILTER: 'JSON_FILTER',
  FORMAT_CONVERTER: 'FORMAT_CONVERTER',
  SCHEMA_DETECTOR: 'SCHEMA_DETECTOR'
};

/**
 * Get the actual storage key - always returns shared key
 */
export function getStorageKey(pageKey: string): string {
  return SHARED_KEY;
}

/**
 * Get share across pages preference
 */
export function getShareAcrossPages(): boolean {
  try {
    const saved = localStorage.getItem('json_utils_share_across_pages');
    return saved === null ? true : saved === 'true'; // Default to true
  } catch (e) {
    return true;
  }
}

/**
 * Set share across pages preference
 */
export function setShareAcrossPages(enabled: boolean): void {
  try {
    localStorage.setItem('json_utils_share_across_pages', enabled.toString());
  } catch (e) {
    console.error('Failed to save share preference:', e);
  }
}
