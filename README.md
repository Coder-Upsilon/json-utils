<div align="center">

# 🔧 JSON Utils

### A comprehensive, free online JSON processing toolkit

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-onlinejsonutils.com-667eea?style=for-the-badge)](https://www.onlinejsonutils.com)
[![GitHub](https://img.shields.io/badge/GitHub-Coder--Upsilon%2Fjson--utils-181717?style=for-the-badge&logo=github)](https://github.com/Coder-Upsilon/json-utils/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Format • Validate • Convert • Filter • Detect Schema**

[🚀 Try It Now](https://www.onlinejsonutils.com) • [📖 Documentation](#features) • [🐛 Report Bug](https://github.com/Coder-Upsilon/json-utils/issues) • [✨ Request Feature](https://github.com/Coder-Upsilon/json-utils/issues)

</div>

---

## ✨ Features

### 🎯 Core Tools

<table>
<tr>
<td width="50%">

#### 📝 JSON Formatter & Validator
- ✅ Real-time syntax validation
- 🔧 Automatic JSON repair
- 🎨 Pretty print, minify, stringify
- 💡 Syntax highlighting

</td>
<td width="50%">

#### 🔍 JSON Schema Detector
- 🤖 Automatic schema generation
- 📋 Dual format support
- 🎯 Dictionary pattern detection
- ⚡ Real-time inference

</td>
</tr>
<tr>
<td width="50%">

#### 🔎 JSONPath Filter
- 🎯 Query with JSONPath expressions
- 📚 Interactive syntax guide
- 🌟 Wildcards & filters
- ⚡ Real-time results

</td>
<td width="50%">

#### 🔄 Format Converter
- 🔀 JSON ↔ YAML ↔ XML ↔ CSV
- ↔️ Bidirectional conversion
- ✔️ Automatic validation
- 🎨 Syntax highlighting

</td>
</tr>
</table>

### 🌍 Internationalization

- 🇬🇧 English & 🇨🇳 Chinese (Simplified)
- 🔀 Easy language switcher
- 🔍 SEO-optimized with hreflang tags

### 🔒 Privacy & Security

<table>
<tr>
<td align="center">💻</td>
<td><strong>100% Client-Side</strong><br/>All processing happens in your browser</td>
<td align="center">🚫</td>
<td><strong>No Data Storage</strong><br/>We never store or transmit your data</td>
</tr>
<tr>
<td align="center">⚡</td>
<td><strong>Lightning Fast</strong><br/>No server requests needed</td>
<td align="center">📴</td>
<td><strong>Offline Capable</strong><br/>Works offline once loaded</td>
</tr>
</table>

---

## 🚀 Quick Start

### 📋 Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### 💿 Installation

```bash
# Clone the repository
git clone https://github.com/Coder-Upsilon/json-utils.git
cd json-utils

# Install dependencies
npm install
```

### 🛠️ Development

```bash
# Build templates
npm run build-templates

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

---

## 🏗️ Technology Stack

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?style=for-the-badge&logo=webpack&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![CodeMirror](https://img.shields.io/badge/CodeMirror-D30707?style=for-the-badge&logo=codemirror&logoColor=white)

</div>

### Core Technologies

- **TypeScript** - Type-safe application code
- **Webpack 5** - Module bundling and optimization
- **CodeMirror** - Advanced code editor with syntax highlighting
- **Handlebars** - Template engine for HTML generation
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization

### Key Libraries

- `jsonpath-plus` - JSONPath query engine
- `js-yaml` - YAML parser and serializer
- `jsonrepair` - Automatic JSON repair
- `to-json-schema` - Schema generation

---

## 📁 Project Structure

```
json-utils/
├── src/
│   ├── assets/           # Images and static files
│   ├── css/              # Stylesheets
│   ├── locales/          # i18n translation files
│   ├── templates/        # Handlebars templates
│   ├── utils/            # TypeScript utilities
│   └── *.ts              # Page-specific TypeScript
├── docs/                 # Build output (GitHub Pages)
├── memory-bank/          # Project documentation
└── webpack.config.js     # Build configuration
```

---

## 📚 Features in Detail

### 🔍 Schema Detector

Automatically analyzes JSON and generates schemas in two formats:

**Simple Format (TypeScript-like):**
```typescript
{
  "name": "String",
  "age": "Integer",
  "active": "Boolean",
  "tags": "String[]"
}
```

**JSON Schema Format (Draft-07):**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" }
  }
}
```

### 🔎 JSONPath Filter

Supports standard JSONPath syntax:

```javascript
$.store.book[*].title          // All book titles
$.store.book[?(@.price < 10)]  // Books under $10
$..author                      // All authors (recursive)
$.store.book[0,1]              // First two books
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Report Bugs

Found a bug? [Create an issue](https://github.com/Coder-Upsilon/json-utils/issues/new) with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### ✨ Request Features

Have an idea? [Open a feature request](https://github.com/Coder-Upsilon/json-utils/issues/new) with:
- Description of the feature
- Use case and benefits
- Mockups or examples (if applicable)

### 💻 Submit Pull Requests

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

---

## 📈 SEO & Performance

- ✅ Semantic HTML with proper heading hierarchy
- ✅ Meta tags optimized for search engines
- ✅ Open Graph tags for social sharing
- ✅ Structured data with JSON-LD
- ✅ XML sitemap with hreflang alternates
- ✅ Mobile-first responsive design
- ✅ Lazy loading for optimal performance

---

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome/Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Mobile | iOS Safari, Chrome Mobile |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Built with industry-standard libraries
- Inspired by the need for privacy-focused JSON tools
- Thanks to all contributors and users! ❤️

---

## 📬 Links

<div align="center">

[![Website](https://img.shields.io/badge/🌐_Website-onlinejsonutils.com-667eea?style=for-the-badge)](https://www.onlinejsonutils.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Coder-Upsilon/json-utils/)
[![Issues](https://img.shields.io/badge/Report-Issues-red?style=for-the-badge&logo=github)](https://github.com/Coder-Upsilon/json-utils/issues)

</div>

---

<div align="center">

**Made with ❤️ for developers who value privacy and efficiency**

⭐ Star us on GitHub if you find this useful!

</div>
