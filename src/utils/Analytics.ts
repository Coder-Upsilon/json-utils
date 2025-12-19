/**
 * Analytics utility for tracking user events with Google Analytics 4
 */

// Declare gtag function type
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

/**
 * Event categories for organizing analytics data
 */
export enum EventCategory {
    JSON_OPERATIONS = 'json_operations',
    FORMAT_CONVERSION = 'format_conversion',
    JSONPATH_FILTER = 'jsonpath_filter',
    SCHEMA_DETECTION = 'schema_detection',
    USER_INTERACTION = 'user_interaction',
    NAVIGATION = 'navigation',
    ERROR = 'error'
}

/**
 * Predefined event names for consistency
 */
export enum EventName {
    // JSON Operations
    FORMAT_JSON = 'format_json',
    MINIFY_JSON = 'minify_json',
    STRINGIFY_JSON = 'stringify_json',
    PARSE_STRING = 'parse_string',
    REPAIR_JSON = 'repair_json',
    CLEAR_INPUT = 'clear_input',
    LOAD_SAMPLE = 'load_sample',
    COPY_OUTPUT = 'copy_output',
    DOWNLOAD_OUTPUT = 'download_output',
    COPY_TO_INPUT = 'copy_to_input',
    
    // Format Conversion
    CONVERT_TO_YAML = 'convert_to_yaml',
    CONVERT_TO_XML = 'convert_to_xml',
    CONVERT_TO_CSV = 'convert_to_csv',
    CONVERT_FROM_YAML = 'convert_from_yaml',
    CONVERT_FROM_XML = 'convert_from_xml',
    CONVERT_FROM_CSV = 'convert_from_csv',
    
    // JSONPath Filter
    FILTER_JSON = 'filter_json',
    JSONPATH_QUERY = 'jsonpath_query',
    LOAD_JSONPATH_EXAMPLE = 'load_jsonpath_example',
    TOGGLE_HELP_PANEL = 'toggle_help_panel',
    
    // Schema Detection
    INFER_SCHEMA = 'infer_schema',
    SCHEMA_FORMAT_CHANGE = 'schema_format_change',
    
    // User Interaction
    BUTTON_CLICK = 'button_click',
    TOGGLE_SETTING = 'toggle_setting',
    LANGUAGE_CHANGE = 'language_change',
    SHARE_TOGGLE = 'share_toggle',
    
    // Navigation
    PAGE_VIEW = 'page_view',
    EXTERNAL_LINK_CLICK = 'external_link_click',
    
    // Errors
    JSON_PARSE_ERROR = 'json_parse_error',
    CONVERSION_ERROR = 'conversion_error',
    JSONPATH_ERROR = 'jsonpath_error'
}

/**
 * Analytics class for tracking events
 */
class Analytics {
    private static instance: Analytics;
    private isEnabled: boolean = true;
    
    private constructor() {
        // Check if gtag is available
        this.isEnabled = typeof window !== 'undefined' && typeof window.gtag === 'function';
    }
    
    /**
     * Get singleton instance
     */
    public static getInstance(): Analytics {
        if (!Analytics.instance) {
            Analytics.instance = new Analytics();
        }
        return Analytics.instance;
    }
    
    /**
     * Track a custom event
     * @param eventName - Name of the event
     * @param category - Event category
     * @param params - Additional event parameters
     */
    public trackEvent(
        eventName: EventName | string,
        category: EventCategory,
        params?: Record<string, any>
    ): void {
        if (!this.isEnabled) {
            console.debug('[Analytics] Not enabled, skipping event:', eventName);
            return;
        }
        
        try {
            const eventParams = {
                event_category: category,
                ...params
            };
            
            window.gtag('event', eventName, eventParams);
            console.debug('[Analytics] Event tracked:', eventName, eventParams);
        } catch (error) {
            console.error('[Analytics] Failed to track event:', error);
        }
    }
    
    /**
     * Track JSON operation
     */
    public trackJsonOperation(
        operation: EventName,
        inputSize?: number,
        success: boolean = true
    ): void {
        this.trackEvent(operation, EventCategory.JSON_OPERATIONS, {
            input_size: inputSize,
            success
        });
    }
    
    /**
     * Track format conversion
     */
    public trackFormatConversion(
        fromFormat: string,
        toFormat: string,
        success: boolean = true,
        inputSize?: number
    ): void {
        const eventName = `convert_${fromFormat}_to_${toFormat}`;
        this.trackEvent(eventName, EventCategory.FORMAT_CONVERSION, {
            from_format: fromFormat,
            to_format: toFormat,
            success,
            input_size: inputSize
        });
    }
    
    /**
     * Track JSONPath query
     */
    public trackJsonPathQuery(
        query: string,
        resultCount: number,
        success: boolean = true
    ): void {
        this.trackEvent(EventName.JSONPATH_QUERY, EventCategory.JSONPATH_FILTER, {
            query_length: query.length,
            result_count: resultCount,
            success
        });
    }
    
    /**
     * Track schema inference
     */
    public trackSchemaInference(
        format: string,
        inputSize?: number,
        success: boolean = true
    ): void {
        this.trackEvent(EventName.INFER_SCHEMA, EventCategory.SCHEMA_DETECTION, {
            schema_format: format,
            input_size: inputSize,
            success
        });
    }
    
    /**
     * Track button click
     */
    public trackButtonClick(buttonId: string, buttonLabel?: string): void {
        this.trackEvent(EventName.BUTTON_CLICK, EventCategory.USER_INTERACTION, {
            button_id: buttonId,
            button_label: buttonLabel
        });
    }
    
    /**
     * Track error
     */
    public trackError(
        errorType: EventName,
        errorMessage: string,
        context?: string
    ): void {
        this.trackEvent(errorType, EventCategory.ERROR, {
            error_message: errorMessage.substring(0, 100), // Limit message length
            context
        });
    }
    
    /**
     * Track external link click
     */
    public trackExternalLink(url: string): void {
        this.trackEvent(EventName.EXTERNAL_LINK_CLICK, EventCategory.NAVIGATION, {
            link_url: url
        });
    }
    
    /**
     * Track copy action
     */
    public trackCopy(contentType: string, contentSize?: number): void {
        this.trackEvent(EventName.COPY_OUTPUT, EventCategory.USER_INTERACTION, {
            content_type: contentType,
            content_size: contentSize
        });
    }
    
    /**
     * Track download action
     */
    public trackDownload(
        fileType: string,
        fileSize?: number
    ): void {
        this.trackEvent(EventName.DOWNLOAD_OUTPUT, EventCategory.USER_INTERACTION, {
            file_type: fileType,
            file_size: fileSize
        });
    }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Export utility functions for easy access
export function trackEvent(
    eventName: EventName | string,
    category: EventCategory,
    params?: Record<string, any>
): void {
    analytics.trackEvent(eventName, category, params);
}

export function trackJsonOperation(
    operation: EventName,
    inputSize?: number,
    success: boolean = true
): void {
    analytics.trackJsonOperation(operation, inputSize, success);
}

export function trackFormatConversion(
    fromFormat: string,
    toFormat: string,
    success: boolean = true,
    inputSize?: number
): void {
    analytics.trackFormatConversion(fromFormat, toFormat, success, inputSize);
}

export function trackJsonPathQuery(
    query: string,
    resultCount: number,
    success: boolean = true
): void {
    analytics.trackJsonPathQuery(query, resultCount, success);
}

export function trackSchemaInference(
    format: string,
    inputSize?: number,
    success: boolean = true
): void {
    analytics.trackSchemaInference(format, inputSize, success);
}

export function trackButtonClick(buttonId: string, buttonLabel?: string): void {
    analytics.trackButtonClick(buttonId, buttonLabel);
}

export function trackError(
    errorType: EventName,
    errorMessage: string,
    context?: string
): void {
    analytics.trackError(errorType, errorMessage, context);
}

export function trackExternalLink(url: string): void {
    analytics.trackExternalLink(url);
}

export function trackCopy(contentType: string, contentSize?: number): void {
    analytics.trackCopy(contentType, contentSize);
}

export function trackDownload(fileType: string, fileSize?: number): void {
    analytics.trackDownload(fileType, fileSize);
}
