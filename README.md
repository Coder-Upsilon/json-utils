# JSON Utils

A comprehensive, free online JSON processing toolkit with automatic schema detection, JSONPath filtering, format conversion, and more.

🔗 **Live Site:** [https://www.onlinejsonutils.com](https://www.onlinejsonutils.com)

## Features

### 🎯 Core Tools

1. **JSON Formatter & Validator**
   - Real-time syntax validation with detailed error messages
   - Automatic JSON repair for common syntax errors
   - Pretty print, minify, and stringify operations
   - Syntax highlighting with CodeMirror

2. **JSON Schema Detector** 
   - Automatic schema generation from JSON data
   - Dual format support: Simple (TypeScript-like) and JSON Schema draft-07
   - Smart dictionary pattern detection for dynamic-key objects
   - Real-time inference as you type (500ms debounce)
   - Comprehensive array analysis

3. **JSONPath Filter**
   - Query and extract data with JSONPath expressions
   - Interactive syntax guide with examples
   - Support for wildcards, recursive descent, and filter expressions
   - Real-time filtering with instant results

4. **Format Converter**
   - Convert between JSON, YAML, XML, and CSV
   - Bidirectional conversion support
   - Automatic validation for all formats
   - Syntax highlighting for all supported formats

### 🌍 Internationalization

- Full support for English and Chinese (Simplified)
- Language switcher in navigation
- SEO-optimized with hreflang tags
- Chinese pages available at `/cn/` subpath

### 🔒 Privacy & Security

- **100% Client-Side Processing** - All data processing happens in your browser
- **No Data Storage** - We don't store, log, or transmit your data
- **Offline Capable** - Works offline once the page is loaded
- **No Server Requests** - Lightning-fast processing with complete privacy

### 📱 Mobile Optimized

- Responsive design with mobile-first approach
- Touch targets meeting iOS/Android standards (44x44px minimum)
- Optimized editor heights using viewport-relative sizing
- Landscape orientation support

## Technology Stack

- **TypeScript** - Type-safe application code
- **Webpack 5** - Module bundling and build optimization
- **CodeMirror** - Advanced code editor with syntax highlighting
- **Handlebars** - Template engine for HTML generation
- **i18next** - Internationalization framework
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization

### Key Libraries

- `codemirror` - Code editor
- `jsonpath-plus` - JSONPath query engine
- `js-yaml` - YAML parser and serializer
- `xml-js` - XML converter
- `jsonrepair` - Automatic JSON repair
- `to-json-schema` - Schema generation

## Project Structure

```
json-utils/
├── src/
│   ├── assets/           # Images and static files
│   ├── css/              # Stylesheets
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── navigation.css
│   │   ├── responsive.css
│   │   └── content-pages.css
│   ├── locales/          # Translation files
│   │   ├── en.json
│   │   └── zh.json
│   ├── styles/           # Additional styles
│   │   └── main.css
│   ├── templates/        # Handlebars templates
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── partials/
│   ├── utils/            # Utility classes
│   │   ├── CodeMirrorManager.ts
│   │   ├── FormatConverter.ts
│   │   ├── JSONPathFilter.ts
│   │   ├── JSONSchemaInferrer.ts
│   │   └── JSONUtils.ts
│   ├── build-templates.js  # Template builder
│   ├── main.ts           # Home page
│   ├── jsonfilter.ts     # JSONPath filter page
│   ├── formatconvert.ts  # Format converter page
│   ├── schema.ts         # Schema detector page
│   ├── about.ts          # About page
│   └── sitemap.xml       # SEO sitemap
├── docs/                 # Build output (GitHub Pages)
├── memory-bank/          # Project documentation
├── package.json
├── tsconfig.json
├── webpack.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Coder-Upsilon/json-utils.git
cd json-utils

# Install dependencies
npm install
# or
pnpm install
```

### Development Commands

```bash
# Build templates and start development
npm run build-templates

# Start development server (if configured)
npm run dev

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

### Build Process

The build process consists of three main steps:

1. **Template Generation** (`npm run build-templates`)
   - Compiles Handlebars templates
   - Generates HTML pages for both English and Chinese
   - Injects translations using i18next

2. **Webpack Bundling** (`webpack --mode production`)
   - Compiles TypeScript to JavaScript
   - Bundles all dependencies
   - Optimizes CSS with PostCSS and Tailwind
   - Generates source maps

3. **Deployment** (`cp -r dist/* docs/`)
   - Copies built files to docs/ for GitHub Pages
   - Includes HTML, CSS, JS, and assets

## Features in Detail

### Schema Detector

The Schema Detector automatically analyzes JSON data and generates schemas in two formats:

**Simple Format** (TypeScript-like):
```json
{
  "name": "String",
  "age": "Integer",
  "active": "Boolean"
}
```

**JSON Schema Format** (Draft-07):
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" },
    "active": { "type": "boolean" }
  }
}
```

**Dictionary Pattern Detection:**
Automatically detects objects with dynamic keys:
```json
Input: {
  "user_123": { "name": "Alice" },
  "user_456": { "name": "Bob" }
}

Output: {
  "[key: string]": { "name": "String" }
}
```

### JSONPath Filter

Supports standard JSONPath syntax:
- `$` - Root object
- `@` - Current object
- `.` - Child operator
- `..` - Recursive descent
- `*` - Wildcard
- `[n]` - Array index
- `[start:end]` - Array slice
- `[?(@.field)]` - Filter expression

Example queries:
```javascript
$.store.book[*].title          // All book titles
$.store.book[?(@.price < 10)]  // Books under $10
$..author                      // All authors recursively
```

## SEO Optimization

The site is optimized for search engines with:

- **Semantic HTML** with proper heading hierarchy
- **Meta Tags** for each page with targeted keywords
- **Open Graph** tags for social sharing
- **Structured Data** with JSON-LD
- **XML Sitemap** with hreflang alternates
- **Robots.txt** for crawler guidance
- **Mobile-Friendly** responsive design

Target Keywords:
- json utils
- jsonpath filter
- schema detect / json schema detector
- json formatter / json validator
- format converter

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with industry-standard libraries including CodeMirror, JSONPath Plus, and to-json-schema
- Inspired by the need for privacy-focused JSON tools
- Thanks to all contributors and users

## Contact

- Website: [https://www.onlinejsonutils.com](https://www.onlinejsonutils.com)
- GitHub: [https://github.com/Coder-Upsilon/json-utils](https://github.com/Coder-Upsilon/json-utils)

---

Made with ❤️ for developers who value privacy and efficiency.
