# System Patterns

## Architecture Overview
The JSON Utils application follows a modular architecture with separate entry points for different functionality, built with TypeScript and Webpack. The application supports internationalization (i18n) with multiple languages through a build-time translation system.

## Key Technical Decisions

### Internationalization Architecture
The application implements a build-time i18n system that generates separate pages for each language:

```javascript
// Language configuration in build-templates.js
const languages = {
  en: {
    code: 'en',
    name: 'English',
    path: '',           // Root path for English
    locale: 'en_US',
    htmlLang: 'en'
  },
  zh: {
    code: 'zh',
    name: '中文',
    path: 'cn/',        // /cn/ subpath for Chinese
    locale: 'zh_CN',
    htmlLang: 'zh-CN'
  }
};

// Build pages for each language
for (const [langCode, langConfig] of Object.entries(languages)) {
  await i18next.changeLanguage(langCode);
  const t = i18next.t.bind(i18next);
  
  // Generate page with translations
  const pageData = config.getData(t);
  const html = layout({ ...pageData, content: pageContent });
}
```

**Translation System Features:**
- **Build-time Translation**: Pages generated with translations during build
- **i18next Integration**: Professional i18n framework with fallback support
- **Handlebars Helper**: `{{t "key"}}` helper for template translations
- **Language-specific Paths**: English at root (`/`), Chinese at `/cn/`
- **SEO Optimization**: Proper hreflang tags, language-specific meta tags
- **Asset Path Management**: Relative paths adjusted for subdirectories

**URL Structure Pattern:**
```
English:  /              → index.html
          /jsonfilter    → jsonfilter.html
          /about         → about.html

Chinese:  /cn/           → cn/index.html
          /cn/jsonfilter → cn/jsonfilter.html
          /cn/about      → cn/about.html
```

**Benefits:**
- Zero runtime overhead (translations compiled at build time)
- SEO-friendly with language-specific URLs
- Easy to add new languages (just add translation file and config)
- Proper search engine indexing with hreflang tags


### Build System
- **Webpack Configuration**: Multi-entry setup with separate bundles for main (`main.ts`) and JSON filter (`jsonfilter.ts`) functionality
- **Code Splitting**: Vendor chunks are shared between entry points to optimize bundle size
- **Template System**: Handlebars templates with automated HTML generation via `build-templates.js` and i18n integration
- **CSS Processing**: Tailwind CSS with PostCSS processing pipeline
- **Internationalization**: i18next-based translation system with build-time page generation for multiple languages

### Animation-Free CSS Architecture
- **No Page Load Animations**: Complete removal of all `transition: all` properties that cause movement during page initialization
- **Preserved Hover Effects**: Maintained color and shadow changes for user feedback while removing transform animations
- **CSS Bundle Optimization**: Reduced bundle size from 62.8 KiB to 61.2 KiB through animation removal
- **Immediate Page Loads**: Zero movement-based animations ensure instant, clean page rendering

### Always-On Auto-Fix Pattern
The application implements automatic JSON repair without requiring user action:

```typescript
private validateInput(): void {
  try {
    this.lastValidJSON = JSON.parse(input);
    this.showStatus(this.elements.inputStatus, 'Valid JSON', 'success');
  } catch (error) {
    // Always attempt auto-fix (no toggle required)
    this.attemptAutoFix(input, errorMessage);
  }
}

private attemptAutoFix(input: string, originalError: string): void {
  try {
    const fixed = this.customJSONRepair(input);
    const parsed = JSON.parse(fixed);
    
    // Store the fixed JSON for format operations
    this.lastValidJSON = parsed;
    
    // Show what was fixed in the error message
    this.showStatus(this.elements.inputStatus, `Fixed: ${originalError}`, 'info');
    this.displayOutput(JSON.stringify(parsed, null, 2), 'application/json');
  } catch (fixError) {
    // Could not auto-fix, show original error
    this.showStatus(this.elements.inputStatus, `Invalid JSON: ${originalError}`, 'error');
  }
}
```

**Benefits:**
- Zero user action required for JSON repair
- Clear feedback about what was fixed
- Original input preserved for reference
- Fixed JSON immediately available for formatting

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
  - Implements stored JSON pattern with `lastValidJSON` property
  - Always-on auto-fix with intelligent error recovery
  - Consolidated format operations using stored parsed JSON
- **JSONPathFilter**: JSONPath expression filtering and querying
- **CodeMirrorManager**: Centralized editor instance management

### Stored JSON Pattern
The application implements a smart caching pattern to prevent duplicate parsing operations:

```typescript
export class JSONUtils {
  private lastValidJSON: any = null;

  private validateInput(): void {
    const input = this.inputEditor.getValue().trim();
    if (!input) {
      this.lastValidJSON = null;
      return;
    }

    try {
      // Store parsed JSON on successful validation
      this.lastValidJSON = JSON.parse(input);
      this.showStatus(this.elements.inputStatus, 'Valid JSON', 'success');
    } catch (error) {
      // Always attempt auto-fix, update stored JSON if successful
      this.attemptAutoFix(input, errorMessage);
    }
  }

  private handleFormatChange(): void {
    // All format operations use the stored valid JSON
    if (!this.lastValidJSON) {
      return;
    }
    
    // Apply format to stored JSON (never re-parse)
    if (selectedFormat === 'pretty') {
      const formatted = JSON.stringify(this.lastValidJSON, null, 2);
      this.displayOutput(formatted, 'application/json');
    }
    // ... other formats
  }
}
```

**Benefits:**
- Single parse per input change
- No duplicate operations when switching formats
- Consistent results across all format operations
- Better performance and user experience

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

### Duplicate Operation Prevention
The stored JSON pattern prevents duplicate parsing operations:
- Parse input once when it changes
- Store the parsed JSON object
- All format operations use the stored object
- Never re-parse the output text
- Eliminates issues with formatting already-formatted content

### Expandable Error Display
Errors are shown in a user-friendly, progressive disclosure pattern:
- **Collapsed by default**: One-line summary (max 200px width)
- **Click to expand**: Shows full error message with line wrapping
- **Position preservation**: Expands in place without moving
- **Absolute positioning**: Overlays content without resizing layout
- **Clear feedback**: Shows original error when auto-fix succeeds

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
