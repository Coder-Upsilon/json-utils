const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Register partials
const partialsDir = path.join(__dirname, 'templates/partials');
const partialFiles = fs.readdirSync(partialsDir);

partialFiles.forEach(file => {
    const partialName = path.basename(file, '.hbs');
    const partialContent = fs.readFileSync(path.join(partialsDir, file), 'utf8');
    Handlebars.registerPartial(partialName, partialContent);
});

// Register JSON helper for structured data
Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});

// Read layout template
const layoutTemplate = fs.readFileSync(path.join(__dirname, 'templates/layouts/base.hbs'), 'utf8');
const layout = Handlebars.compile(layoutTemplate);

// Page configurations
const pages = {
    'index.html': {
        template: 'index.hbs',
        data: {
            title: 'JSON Utils - Free Online JSON Formatter, Validator & Converter Tool',
            description: 'Professional JSON utility tool for developers. Format, validate, minify, repair JSON data instantly. Convert JSON to YAML/XML. Client-side processing ensures privacy. Free online JSON formatter with advanced features.',
            keywords: 'JSON formatter online, JSON validator tool, JSON minifier, JSON to YAML converter, JSON to XML converter, JSON repair tool, fix JSON syntax errors, online JSON editor, JSON pretty print, validate JSON syntax, JSON string converter, JSON parser online, free JSON tools, developer JSON utilities, API response formatter, JSON data processor',
            canonical: 'https://www.onlinejsonutils.com',
            headerSubtitle: 'Format, Validate, Convert & Fix your JSON data',
            includeCodeMirror: true,
            includeScript: false,
            isHome: true,
            isContentPage: false,
            structuredData: {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "JSON Utils",
                "description": "Professional online JSON formatter, validator, and converter tool for developers",
                "url": "https://www.onlinejsonutils.com",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "featureList": [
                    "JSON Formatting and Pretty Print",
                    "JSON Validation and Error Detection",
                    "JSON Minification",
                    "JSON to YAML Conversion",
                    "JSON to XML Conversion",
                    "JSON Repair and Fix",
                    "JSON String Processing"
                ]
            }
        }
    },
    'jsonfilter.html': {
        template: 'jsonfilter.hbs',
        data: {
            title: 'JSONPath Filter Tool - Advanced JSON Query & Data Extraction Online',
            description: 'Powerful JSONPath query tool for filtering and extracting data from complex JSON structures. Interactive JSONPath expressions with syntax guide, examples, and real-time results. Perfect for API testing and data analysis.',
            keywords: 'JSONPath query tool, JSONPath filter online, JSON data extraction, JSONPath expressions, JSON query language, filter JSON data, JSONPath syntax, JSON path finder, extract JSON values, JSON array filtering, nested JSON query, API response filtering, JSON data mining, JSONPath tutorial, advanced JSON filtering',
            canonical: 'https://www.onlinejsonutils.com/jsonfilter',
            headerSubtitle: 'Filter JSON with JSONPath expressions',
            includeCodeMirror: true,
            includeScript: false,
            isJsonFilter: true,
            isContentPage: false,
            structuredData: {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "JSON Filter - JSONPath Query Tool",
                "description": "Advanced JSONPath query tool for filtering and extracting data from JSON structures",
                "url": "https://www.onlinejsonutils.com/jsonfilter",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "featureList": [
                    "JSONPath Expression Filtering",
                    "Interactive Query Builder",
                    "Syntax Guide and Examples",
                    "Real-time Results",
                    "Complex Data Extraction",
                    "Array and Object Filtering"
                ]
            }
        }
    },
    'about.html': {
        template: 'about.hbs',
        data: {
            title: 'About JSON Utils - Privacy-First Online JSON Processing Tools',
            description: 'Discover JSON Utils - the leading privacy-focused online JSON processing platform. Learn about our client-side processing, security features, and comprehensive JSON tools for developers, analysts, and students.',
            keywords: 'JSON Utils about, privacy-focused JSON tools, client-side JSON processing, secure JSON formatter, JSON tools for developers, JSON processing platform, online JSON utilities, JSON tool features, JSON converter privacy, developer tools online',
            canonical: 'https://www.onlinejsonutils.com/about',
            headerSubtitle: 'About our JSON processing tools',
            includeCodeMirror: false,
            includeScript: false,
            isAbout: true,
            isContentPage: true,
            injectCSS: false,
            structuredData: {
                "@context": "https://schema.org",
                "@type": "AboutPage",
                "name": "About JSON Utils",
                "description": "Learn about JSON Utils - privacy-focused online JSON processing tools",
                "url": "https://www.onlinejsonutils.com/about",
                "mainEntity": {
                    "@type": "Organization",
                    "name": "JSON Utils",
                    "description": "Provider of privacy-focused online JSON processing tools",
                    "url": "https://www.onlinejsonutils.com",
                    "foundingDate": "2025",
                    "knowsAbout": [
                        "JSON Processing",
                        "Data Validation",
                        "Format Conversion",
                        "Privacy-First Development"
                    ]
                }
            }
        }
    }
};

// Build pages
Object.entries(pages).forEach(([filename, config]) => {
    // Read page template
    const pageTemplate = fs.readFileSync(path.join(__dirname, 'templates/pages', config.template), 'utf8');
    const pageContent = Handlebars.compile(pageTemplate)(config.data);
    
    // Render with layout
    const html = layout({
        ...config.data,
        content: pageContent
    });
    
    // Write to output
    fs.writeFileSync(path.join(__dirname, filename), html);
    console.log(`Generated ${filename}`);
});

console.log('Template build complete!');
