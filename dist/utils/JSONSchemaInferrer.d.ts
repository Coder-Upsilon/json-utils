/**
 * JSONSchemaInferrer - Generates JSON Schema and Simple schema from JSON data
 * Uses to-json-schema library for robust JSON Schema generation
 * Derives Simple format from JSON Schema for consistency
 */
export declare class JSONSchemaInferrer {
    /**
     * Generate JSON Schema from data using to-json-schema library
     */
    toJSONSchema(data: any): any;
    /**
     * Detect if object is a dictionary pattern (dynamic keys with similar values)
     * Only detects patterns where values are objects (not primitives)
     */
    private isDictionaryPattern;
    /**
     * Get basic schema structure for comparison
     */
    private getValueSchema;
    /**
     * Enrich array schemas to include full item properties
     */
    private enrichArraySchemas;
    /**
     * Generate Simple schema by converting JSON Schema to simple format
     */
    inferSchema(data: any): any;
    /**
     * Convert JSON Schema to Simple format
     * Extracts just the type information in a readable format
     */
    private jsonSchemaToSimple;
    /**
     * Convert JSON Schema type to Simple type name
     */
    private typeToSimple;
    /**
     * Format the schema as pretty JSON string
     */
    formatSchema(schema: any, indent?: number): string;
}
//# sourceMappingURL=JSONSchemaInferrer.d.ts.map