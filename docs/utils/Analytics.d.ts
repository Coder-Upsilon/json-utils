/**
 * Analytics utility for tracking user events with Google Analytics 4
 */
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}
/**
 * Event categories for organizing analytics data
 */
export declare enum EventCategory {
    JSON_OPERATIONS = "json_operations",
    FORMAT_CONVERSION = "format_conversion",
    JSONPATH_FILTER = "jsonpath_filter",
    SCHEMA_DETECTION = "schema_detection",
    USER_INTERACTION = "user_interaction",
    NAVIGATION = "navigation",
    ERROR = "error"
}
/**
 * Predefined event names for consistency
 */
export declare enum EventName {
    FORMAT_JSON = "format_json",
    MINIFY_JSON = "minify_json",
    STRINGIFY_JSON = "stringify_json",
    PARSE_STRING = "parse_string",
    REPAIR_JSON = "repair_json",
    CLEAR_INPUT = "clear_input",
    LOAD_SAMPLE = "load_sample",
    COPY_OUTPUT = "copy_output",
    DOWNLOAD_OUTPUT = "download_output",
    COPY_TO_INPUT = "copy_to_input",
    CONVERT_TO_YAML = "convert_to_yaml",
    CONVERT_TO_XML = "convert_to_xml",
    CONVERT_TO_CSV = "convert_to_csv",
    CONVERT_FROM_YAML = "convert_from_yaml",
    CONVERT_FROM_XML = "convert_from_xml",
    CONVERT_FROM_CSV = "convert_from_csv",
    FILTER_JSON = "filter_json",
    JSONPATH_QUERY = "jsonpath_query",
    LOAD_JSONPATH_EXAMPLE = "load_jsonpath_example",
    TOGGLE_HELP_PANEL = "toggle_help_panel",
    INFER_SCHEMA = "infer_schema",
    SCHEMA_FORMAT_CHANGE = "schema_format_change",
    BUTTON_CLICK = "button_click",
    TOGGLE_SETTING = "toggle_setting",
    LANGUAGE_CHANGE = "language_change",
    SHARE_TOGGLE = "share_toggle",
    PAGE_VIEW = "page_view",
    EXTERNAL_LINK_CLICK = "external_link_click",
    JSON_PARSE_ERROR = "json_parse_error",
    CONVERSION_ERROR = "conversion_error",
    JSONPATH_ERROR = "jsonpath_error"
}
/**
 * Analytics class for tracking events
 */
declare class Analytics {
    private static instance;
    private isEnabled;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): Analytics;
    /**
     * Track a custom event
     * @param eventName - Name of the event
     * @param category - Event category
     * @param params - Additional event parameters
     */
    trackEvent(eventName: EventName | string, category: EventCategory, params?: Record<string, any>): void;
    /**
     * Track JSON operation
     */
    trackJsonOperation(operation: EventName, inputSize?: number, success?: boolean): void;
    /**
     * Track format conversion
     */
    trackFormatConversion(fromFormat: string, toFormat: string, success?: boolean, inputSize?: number): void;
    /**
     * Track JSONPath query
     */
    trackJsonPathQuery(query: string, resultCount: number, success?: boolean): void;
    /**
     * Track schema inference
     */
    trackSchemaInference(format: string, inputSize?: number, success?: boolean): void;
    /**
     * Track button click
     */
    trackButtonClick(buttonId: string, buttonLabel?: string): void;
    /**
     * Track error
     */
    trackError(errorType: EventName, errorMessage: string, context?: string): void;
    /**
     * Track external link click
     */
    trackExternalLink(url: string): void;
    /**
     * Track copy action
     */
    trackCopy(contentType: string, contentSize?: number): void;
    /**
     * Track download action
     */
    trackDownload(fileType: string, fileSize?: number): void;
}
export declare const analytics: Analytics;
export declare function trackEvent(eventName: EventName | string, category: EventCategory, params?: Record<string, any>): void;
export declare function trackJsonOperation(operation: EventName, inputSize?: number, success?: boolean): void;
export declare function trackFormatConversion(fromFormat: string, toFormat: string, success?: boolean, inputSize?: number): void;
export declare function trackJsonPathQuery(query: string, resultCount: number, success?: boolean): void;
export declare function trackSchemaInference(format: string, inputSize?: number, success?: boolean): void;
export declare function trackButtonClick(buttonId: string, buttonLabel?: string): void;
export declare function trackError(errorType: EventName, errorMessage: string, context?: string): void;
export declare function trackExternalLink(url: string): void;
export declare function trackCopy(contentType: string, contentSize?: number): void;
export declare function trackDownload(fileType: string, fileSize?: number): void;
export {};
//# sourceMappingURL=Analytics.d.ts.map