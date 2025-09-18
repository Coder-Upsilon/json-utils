# System Patterns

## Architecture Overview
The JSON Utils application follows a modular architecture with separate entry points for different functionality, built with TypeScript and Webpack.

## Key Technical Decisions

### Build System
- **Webpack Configuration**: Multi-entry setup with separate bundles for main (`main.ts`) and JSON filter (`jsonfilter.ts`) functionality
- **Code Splitting**: Vendor chunks are shared between entry points to optimize bundle size
- **Template System**: Handlebars templates with automated HTML generation via `build-templates.js`
- **CSS Processing**: Tailwind CSS with PostCSS processing pipeline

### Animation-Free CSS Architecture
- **No Page Load Animations**: Complete removal of all `transition: all` properties that cause movement during page initialization
- **Preserved Hover Effects**: Maintained color and shadow changes for user feedback while removing transform animations
- **CSS Bundle Optimization**: Reduced bundle size from 62.8 KiB to 61.2 KiB through animation removal
- **Immediate Page Loads**: Zero movement-based animations ensure instant, clean page rendering

### CodeMirror Management Pattern
- **Centralized Instance Management**: `CodeMirrorManager` utility class prevents duplicate editor instances
- **Singleton Pattern**: Each textarea ID maps to a single CodeMirror instance
- **Automatic Reuse**: Existing instances are returned instead of creating duplicates
- **Configuration Standardization**: Consistent editor configuration across all instances
- **Enhanced Features**: Bracket matching with visual highlighting and custom styling

```typescript
// CodeMirror Management Pattern with Enhanced Features
export class CodeMirrorManager {
  private static instances = new Map<string, CodeMirror.Editor>();
  
  static initializeEditor(textareaId: string, config: CodeMirrorConfig): CodeMirror.Editor | null {
    // Check for existing instance first
    if (this.hasInstance(textareaId)) {
      return this.getInstance(textareaId);
    }
    
    // Default configuration with enhanced features
    const defaultConfig = {
      mode: 'application/json',
      theme: 'material-darker',
      lineNumbers: true,
      lineWrapping: true,
      readOnly: false,
      indentUnit: 2,
      tabSize: 2,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      matchBrackets: true, // Enhanced bracket matching
      extraKeys: {
        'Ctrl-Q': (cm: any) => cm.foldCode(cm.getCursor()),
        'Cmd-Q': (cm: any) => cm.foldCode(cm.getCursor())
      }
    };
    
    // Create new instance only if none exists
    const editor = CodeMirror.fromTextArea(textarea, { ...defaultConfig, ...config });
    this.instances.set(textareaId, editor);
    return editor;
  }
}
```

## Design Patterns in Use

### Utility Classes
- **JSONUtils**: Main JSON processing functionality (format, validate, convert)
- **JSONPathFilter**: JSONPath expression filtering and querying
- **CodeMirrorManager**: Centralized editor instance management

### Template Architecture
- **Base Layout**: `layouts/base.hbs` provides common structure
- **Page Templates**: Individual pages extend base layout
- **Partial Components**: Reusable header/footer components
- **Webpack Integration**: Automatic script injection, no manual script tags

### Component Relationships
```
base.hbs (layout)
├── header.hbs (partial)
├── footer.hbs (partial)
└── page content
    ├── index.hbs → JSONUtils
    └── jsonfilter.hbs → JSONPathFilter
```

## Critical Implementation Paths

### Script Loading Strategy
- **Webpack Handles All Injection**: No manual `<script>` tags in templates
- **Entry Point Separation**: Each page loads only its designated script
- **Shared Dependencies**: Vendor chunks contain common libraries (CodeMirror, etc.)
- **Consistent Injection Pattern**: All pages use `inject: true` for automatic CSS/JS injection
- **Template Independence**: Templates focus on content, webpack handles all asset references

### Editor Initialization Flow
1. Page loads with appropriate script (main.js or jsonfilter.js)
2. Utility class constructor calls CodeMirrorManager.initializeEditor()
3. Manager checks for existing instance on textarea ID
4. Returns existing instance or creates new one
5. Editor is configured with standard settings

### Template Processing Pipeline
1. `build-templates.js` processes Handlebars templates
2. Webpack processes TypeScript and CSS
3. HTML files generated with proper script injection
4. Development server serves processed files

## Error Prevention Patterns

### CodeMirror Duplication Prevention
- Instance checking before creation
- Centralized management through singleton
- Proper cleanup methods available
- Console logging for debugging

### Animation Prevention Patterns
- **Root Cause Analysis**: Identified `transition: all` as source of page load animations
- **Systematic Removal**: Removed all transition-based animations while preserving visual feedback
- **CSS Architecture**: Separated movement animations from color/shadow effects
- **Build Verification**: CSS bundle size monitoring to confirm animation removal

### Build System Safeguards
- Separate entry points prevent cross-contamination
- Template system prevents manual script conflicts
- Webpack handles all resource injection automatically
- Animation-free CSS ensures immediate page loads
