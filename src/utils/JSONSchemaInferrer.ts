/**
 * JSONSchemaInferrer - Generates JSON Schema and Simple schema from JSON data
 * Uses to-json-schema library for robust JSON Schema generation
 * Derives Simple format from JSON Schema for consistency
 */

const toJsonSchema = require('to-json-schema');

export class JSONSchemaInferrer {
    /**
     * Generate JSON Schema from data using to-json-schema library
     */
    public toJSONSchema(data: any): any {
        const schema = toJsonSchema(data, {
            required: true,
            arrays: {
                mode: 'first' // Use first item as template, then merge
            },
            strings: {
                detectFormat: false
            },
            postProcessFnc: (type: string, schema: any, value: any) => {
                // Ensure proper handling of integers
                if (type === 'number' && Number.isInteger(value)) {
                    schema.type = 'integer';
                }
                return schema;
            }
        });
        
        // Post-process to properly handle arrays
        return this.enrichArraySchemas(schema, data);
    }

    /**
     * Detect if object is a dictionary pattern (dynamic keys with similar values)
     * Only detects patterns where values are objects (not primitives)
     */
    private isDictionaryPattern(data: any): boolean {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return false;
        }

        const keys = Object.keys(data);
        // Need at least 2 keys to detect a pattern
        if (keys.length < 2) {
            return false;
        }

        // First value must be an object (not primitive or array)
        const firstValue = data[keys[0]];
        if (!firstValue || typeof firstValue !== 'object' || Array.isArray(firstValue)) {
            return false;
        }

        // Check if all values have similar structure
        const firstValueSchema = JSON.stringify(this.getValueSchema(firstValue));
        
        for (let i = 1; i < keys.length; i++) {
            const value = data[keys[i]];
            
            // All values must be objects
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                return false;
            }
            
            const currentSchema = JSON.stringify(this.getValueSchema(value));
            if (currentSchema !== firstValueSchema) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get basic schema structure for comparison
     */
    private getValueSchema(value: any): any {
        if (value === null) return { type: 'null' };
        if (Array.isArray(value)) return { type: 'array' };
        
        const type = typeof value;
        if (type === 'object') {
            // Return structure with keys
            return {
                type: 'object',
                keys: Object.keys(value).sort()
            };
        }
        
        return { type };
    }

    /**
     * Enrich array schemas to include full item properties
     */
    private enrichArraySchemas(schema: any, data: any): any {
        if (!schema || typeof schema !== 'object') {
            return schema;
        }

        // Check for dictionary pattern at object level
        if (schema.type === 'object' && schema.properties && this.isDictionaryPattern(data)) {
            const keys = Object.keys(data);
            const firstValue = data[keys[0]];
            
            // Generate schema for the pattern
            const valueSchema = toJsonSchema(firstValue, {
                required: true,
                strings: { detectFormat: false }
            });
            
            // Enrich nested structures
            const enrichedValueSchema = this.enrichArraySchemas(valueSchema, firstValue);
            
            return {
                type: 'object',
                additionalProperties: enrichedValueSchema
            };
        }

        if (schema.type === 'array' && schema.items && Array.isArray(data) && data.length > 0) {
            // If array contains objects, merge properties from all items
            if (typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
                const allKeys = new Set<string>();
                const propertySchemas: any = {};
                
                // Collect all keys from all array items
                for (const item of data) {
                    if (typeof item === 'object' && item !== null) {
                        Object.keys(item).forEach(key => allKeys.add(key));
                    }
                }
                
                // Generate schema for each property
                for (const key of allKeys) {
                    const values = data
                        .filter((item: any) => typeof item === 'object' && item !== null && key in item)
                        .map((item: any) => item[key]);
                    
                    if (values.length > 0) {
                        propertySchemas[key] = toJsonSchema(values[0], {
                            required: true,
                            strings: { detectFormat: false }
                        });
                        
                        // Check if property can be null
                        const hasNull = data.some((item: any) => 
                            typeof item === 'object' && item !== null && item[key] === null
                        );
                        
                        if (hasNull) {
                            const currentType = propertySchemas[key].type;
                            propertySchemas[key].type = Array.isArray(currentType) 
                                ? [...currentType, 'null']
                                : [currentType, 'null'];
                        }
                    }
                }
                
                schema.items = {
                    type: 'object',
                    properties: propertySchemas,
                    required: Array.from(allKeys)
                };
            }
            
            // Recursively process nested arrays
            if (schema.items) {
                schema.items = this.enrichArraySchemas(schema.items, data[0]);
            }
        }

        // Recursively process object properties
        if (schema.type === 'object' && schema.properties) {
            for (const [key, value] of Object.entries(schema.properties)) {
                if (data && typeof data === 'object' && key in data) {
                    schema.properties[key] = this.enrichArraySchemas(value, data[key]);
                }
            }
        }

        return schema;
    }

    /**
     * Generate Simple schema by converting JSON Schema to simple format
     */
    public inferSchema(data: any): any {
        const jsonSchema = this.toJSONSchema(data);
        return this.jsonSchemaToSimple(jsonSchema);
    }

    /**
     * Convert JSON Schema to Simple format
     * Extracts just the type information in a readable format
     */
    private jsonSchemaToSimple(schema: any): any {
        if (!schema || typeof schema !== 'object') {
            return 'any';
        }

        const type = schema.type;

        if (Array.isArray(type)) {
            // Union types
            return type.map((t: string) => this.typeToSimple(t)).join(' | ');
        }

        if (type === 'object') {
            // Check for dictionary pattern (additionalProperties)
            if (schema.additionalProperties && !schema.properties) {
                const valueSchema = this.jsonSchemaToSimple(schema.additionalProperties);
                return {
                    '[key: string]': valueSchema
                };
            }
            
            // Regular object with properties
            if (schema.properties) {
                const simple: any = {};
                for (const [key, value] of Object.entries(schema.properties)) {
                    simple[key] = this.jsonSchemaToSimple(value);
                }
                return simple;
            }
            
            return 'Object';
        }

        if (type === 'array' && schema.items) {
            const itemSchema = this.jsonSchemaToSimple(schema.items);
            if (typeof itemSchema === 'object' && !Array.isArray(itemSchema)) {
                // For arrays of objects, just return the object schema in an array
                return [itemSchema];
            }
            return `Array<${itemSchema}>`;
        }

        return this.typeToSimple(type);
    }

    /**
     * Convert JSON Schema type to Simple type name
     */
    private typeToSimple(type: string): string {
        switch (type) {
            case 'string':
                return 'String';
            case 'number':
                return 'Number';
            case 'integer':
                return 'Integer';
            case 'boolean':
                return 'Boolean';
            case 'null':
                return 'null';
            case 'object':
                return 'Object';
            case 'array':
                return 'Array';
            default:
                return type;
        }
    }

    /**
     * Format the schema as pretty JSON string
     */
    public formatSchema(schema: any, indent: number = 2): string {
        return JSON.stringify(schema, null, indent);
    }
}
