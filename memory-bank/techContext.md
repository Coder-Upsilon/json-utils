# Tech Context

## Technologies Used

### Core Technologies
- **TypeScript**: Primary development language for type safety and better developer experience
- **Webpack 5**: Module bundler with multi-entry configuration for separate page functionality
- **Node.js**: Development environment and build tooling
- **Handlebars**: Template engine for HTML generation with reusable components

### Frontend Libraries
- **CodeMirror 5**: Advanced code editor with syntax highlighting and code folding
- **JSONPath**: Library for querying JSON data using JSONPath expressions
- **jsonrepair**: Utility for automatically fixing common JSON formatting issues
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Internationalization
- **i18next**: Professional i18n framework for translation management
- **i18next-fs-backend**: File system backend for loading translation files

### Build Tools & Processing
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **CSS Loader**: Webpack loader for processing CSS files
- **TS Loader**: TypeScript compilation within webpack
- **MiniCssExtractPlugin**: CSS extraction for production builds
- **HtmlWebpackPlugin**: Automated HTML generation with proper asset injection
- **Handlebars**: Template engine for HTML generation with i18n helper support

## Development Setup

### Project Structure
```
src/
├── utils/           # Core utility classes
├── templates/       # Handlebars templates
├── styles/          # Tailwind CSS and custom styles
├── assets/          # Static assets (icons, images)
├── main.ts         # Main page entry point
└── jsonfilter.ts   # JSON filter page entry point
```

### Build Configuration
- **Multi-entry Setup**: Separate bundles for different page functionality
- **Code Splitting**: Vendor chunks shared between entry points
- **Development Server**: Hot module replacement for rapid development
- **Production Optimization**: Minification, content hashing, and asset optimization

## Technical Constraints

### Browser Compatibility
- **Modern Browsers**: ES6+ features used throughout
- **CodeMirror Requirements**: Requires JavaScript-enabled browsers
- **CSS Grid/Flexbox**: Modern layout techniques for responsive design

### Performance Considerations
- **Client-side Processing**: All JSON operations happen in browser for privacy
- **Bundle Size**: Webpack optimization to minimize JavaScript payload
- **Code Splitting**: Separate bundles prevent loading unnecessary code
- **CSS Processing**: Tailwind purging removes unused styles

## Dependencies

### Production Dependencies
- `codemirror`: Code editor functionality
- `jsonpath`: JSONPath query processing
- `jsonrepair`: JSON error correction

### Development Dependencies (i18n)
- `i18next`: Core i18n framework for translation management
- `i18next-fs-backend`: Backend for loading translation files from filesystem
- `handlebars`: Template engine with i18n helper registration

### Development Dependencies
- `webpack` & plugins: Build system and optimization
- `typescript`: Type checking and compilation
- `tailwindcss`: CSS framework and processing
- `postcss`: CSS transformation pipeline

## Tool Usage Patterns

### Development Workflow
1. **Translation Loading**: i18next loads translation files for all languages
2. **Template Processing**: Handlebars templates compiled to HTML with i18n helper
3. **Multi-language Generation**: Build system generates pages for each language
4. **TypeScript Compilation**: Source code compiled with type checking
5. **CSS Processing**: Tailwind CSS processed through PostCSS
6. **Asset Bundling**: Webpack bundles and optimizes all assets
7. **Development Server**: Live reload for rapid iteration

### Production Build
1. **Code Minification**: JavaScript and CSS minified for production
2. **Asset Hashing**: Content-based hashing for cache busting
3. **Bundle Analysis**: Webpack bundle analyzer for optimization insights
4. **Static Generation**: All HTML files pre-generated for deployment

## Architecture Decisions

### CodeMirror Management
- **Centralized Control**: Single manager class prevents duplicate instances
- **Singleton Pattern**: One editor instance per textarea element
- **Configuration Consistency**: Standardized editor settings across pages

### Script Loading Strategy
- **Webpack Injection**: Automatic script tag generation and injection
- **Entry Point Separation**: Each page loads only required functionality
- **No Manual Scripts**: Template system relies entirely on webpack
- **Language-specific Assets**: Proper asset path handling for subdirectory pages

### Internationalization Architecture
- **Build-time Translation**: Pages generated with translations during build process
- **i18next Integration**: Professional i18n framework with Handlebars helper
- **Translation Files**: JSON files in `src/locales/` directory (en.json, zh.json)
- **Language Configuration**: Language codes, paths, and locales defined in build script
- **SEO Optimization**: Language-specific meta tags and hreflang links generated
- **URL Structure**: English at root, Chinese at `/cn/` subpath

### CSS Architecture
- **Utility-First**: Tailwind CSS for rapid development and consistency
- **Component Layer**: Custom components for complex UI patterns
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Security Considerations
- **Client-side Processing**: No data sent to external servers
- **XSS Prevention**: Proper escaping in templates and user input handling
- **Content Security Policy**: Prepared for CSP implementation if needed
