const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

// Initialize i18next
async function initI18n() {
    await i18next
        .use(Backend)
        .init({
            lng: 'en',
            fallbackLng: 'en',
            backend: {
                loadPath: path.join(__dirname, 'locales/{{lng}}.json')
            }
        });
}

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

// Register i18n helper
Handlebars.registerHelper('t', function(key) {
    return i18next.t(key);
});

// Register ifEqual helper for language switcher
Handlebars.registerHelper('ifEqual', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Read layout template
const layoutTemplate = fs.readFileSync(path.join(__dirname, 'templates/layouts/base.hbs'), 'utf8');
const layout = Handlebars.compile(layoutTemplate);

// Language configurations
const languages = {
    en: {
        code: 'en',
        name: 'English',
        path: '',
        locale: 'en_US',
        htmlLang: 'en'
    },
    zh: {
        code: 'zh',
        name: '中文',
        path: 'cn/',
        locale: 'zh_CN',
        htmlLang: 'zh-CN'
    }
};

// Page configurations
function getPageConfig(lang, langConfig) {
    const basePath = langConfig.path ? `/${langConfig.path}` : '/';
    const baseUrl = 'https://www.onlinejsonutils.com';
    
    return {
        'index.html': {
            template: 'index.hbs',
            getData: (t) => ({
                title: t('meta.index.title'),
                description: t('meta.index.description'),
                keywords: t('meta.index.keywords'),
                canonical: `${baseUrl}${basePath}`,
                headerSubtitle: t('header.subtitle.home'),
                includeCodeMirror: true,
                includeScript: false,
                isHome: true,
                isContentPage: false,
                lang: lang,
                langPath: langConfig.path,
                currentLang: langConfig.code,
                htmlLang: langConfig.htmlLang,
                locale: langConfig.locale,
                alternateUrls: {
                    en: `${baseUrl}/`,
                    zh: `${baseUrl}/cn/`
                },
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "JSON Utils",
                    "description": t('meta.index.description'),
                    "url": `${baseUrl}${basePath}`,
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": "Web Browser",
                    "inLanguage": langConfig.htmlLang,
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
            })
        },
        'jsonfilter.html': {
            template: 'jsonfilter.hbs',
            getData: (t) => ({
                title: t('meta.jsonfilter.title'),
                description: t('meta.jsonfilter.description'),
                keywords: t('meta.jsonfilter.keywords'),
                canonical: `${baseUrl}${basePath}jsonfilter`,
                headerSubtitle: t('header.subtitle.jsonFilter'),
                includeCodeMirror: true,
                includeScript: false,
                isJsonFilter: true,
                isContentPage: false,
                lang: lang,
                langPath: langConfig.path,
                currentLang: langConfig.code,
                htmlLang: langConfig.htmlLang,
                locale: langConfig.locale,
                alternateUrls: {
                    en: `${baseUrl}/jsonfilter`,
                    zh: `${baseUrl}/cn/jsonfilter`
                },
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "JSON Filter - JSONPath Query Tool",
                    "description": t('meta.jsonfilter.description'),
                    "url": `${baseUrl}${basePath}jsonfilter`,
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": "Web Browser",
                    "inLanguage": langConfig.htmlLang,
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
            })
        },
        'formatconvert.html': {
            template: 'formatconvert.hbs',
            getData: (t) => ({
                title: t('meta.formatconvert.title'),
                description: t('meta.formatconvert.description'),
                keywords: t('meta.formatconvert.keywords'),
                canonical: `${baseUrl}${basePath}formatconvert`,
                headerSubtitle: t('header.subtitle.formatConvert'),
                includeCodeMirror: true,
                includeScript: false,
                isFormatConvert: true,
                isContentPage: false,
                lang: lang,
                langPath: langConfig.path,
                currentLang: langConfig.code,
                htmlLang: langConfig.htmlLang,
                locale: langConfig.locale,
                alternateUrls: {
                    en: `${baseUrl}/formatconvert`,
                    zh: `${baseUrl}/cn/formatconvert`
                },
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "JSON Format Converter",
                    "description": t('meta.formatconvert.description'),
                    "url": `${baseUrl}${basePath}formatconvert`,
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": "Web Browser",
                    "inLanguage": langConfig.htmlLang,
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "featureList": [
                        "JSON to YAML Conversion",
                        "JSON to XML Conversion",
                        "Format Validation",
                        "Auto-Fix JSON Errors",
                        "Syntax Highlighting",
                        "Client-Side Processing"
                    ]
                }
            })
        },
        'schema.html': {
            template: 'schema.hbs',
            getData: (t) => ({
                title: 'JSON Schema Inference - Analyze JSON Structure Online | JSON Utils',
                description: 'Automatically infer schema from JSON data. Detect types, enums, and structure. Perfect for understanding data patterns and documenting APIs. 100% client-side processing.',
                keywords: 'JSON schema inference, JSON type detection, JSON enum detection, analyze JSON structure, JSON schema generator, understand JSON data, JSON patterns, API documentation',
                canonical: `${baseUrl}${basePath}schema`,
                headerSubtitle: t('header.subtitle.schema'),
                includeCodeMirror: true,
                includeScript: false,
                isSchema: true,
                isContentPage: false,
                lang: lang,
                langPath: langConfig.path,
                currentLang: langConfig.code,
                htmlLang: langConfig.htmlLang,
                locale: langConfig.locale,
                alternateUrls: {
                    en: `${baseUrl}/schema`,
                    zh: `${baseUrl}/cn/schema`
                },
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "JSON Schema Inference Tool",
                    "description": 'Automatically infer schema from JSON data showing types, enums, and structure',
                    "url": `${baseUrl}${basePath}schema`,
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": "Web Browser",
                    "inLanguage": langConfig.htmlLang,
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "featureList": [
                        "Automatic Type Detection",
                        "Enum Value Inference",
                        "Array Schema Analysis",
                        "Nested Structure Support",
                        "Client-Side Processing",
                        "Privacy-First Design"
                    ]
                }
            })
        },
        'about.html': {
            template: 'about.hbs',
            getData: (t) => ({
                title: t('meta.about.title'),
                description: t('meta.about.description'),
                keywords: t('meta.about.keywords'),
                canonical: `${baseUrl}${basePath}about`,
                headerSubtitle: t('header.subtitle.about'),
                includeCodeMirror: false,
                includeScript: false,
                isAbout: true,
                isContentPage: true,
                injectCSS: false,
                lang: lang,
                langPath: langConfig.path,
                currentLang: langConfig.code,
                htmlLang: langConfig.htmlLang,
                locale: langConfig.locale,
                alternateUrls: {
                    en: `${baseUrl}/about`,
                    zh: `${baseUrl}/cn/about`
                },
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "AboutPage",
                    "name": "About JSON Utils",
                    "description": t('meta.about.description'),
                    "url": `${baseUrl}${basePath}about`,
                    "inLanguage": langConfig.htmlLang,
                    "mainEntity": {
                        "@type": "Organization",
                        "name": "JSON Utils",
                        "description": "Provider of privacy-focused online JSON processing tools",
                        "url": baseUrl,
                        "foundingDate": "2025",
                        "knowsAbout": [
                            "JSON Processing",
                            "Data Validation",
                            "Format Conversion",
                            "Privacy-First Development"
                        ]
                    }
                }
            })
        }
    };
}

// Build pages for all languages
async function buildPages() {
    await initI18n();
    
    for (const [langCode, langConfig] of Object.entries(languages)) {
        // Change language
        await i18next.changeLanguage(langCode);
        const t = i18next.t.bind(i18next);
        
        // Get page configurations for this language
        const pages = getPageConfig(langCode, langConfig);
        
        // Create output directory for non-English languages
        const outputDir = langConfig.path ? path.join(__dirname, langConfig.path) : __dirname;
        if (langConfig.path && !fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Build pages
        Object.entries(pages).forEach(([filename, config]) => {
            // Read page template
            const pageTemplate = fs.readFileSync(path.join(__dirname, 'templates/pages', config.template), 'utf8');
            const pageData = config.getData(t);
            const pageContent = Handlebars.compile(pageTemplate)(pageData);
            
            // Render with layout
            const html = layout({
                ...pageData,
                content: pageContent
            });
            
            // Write to output
            const outputPath = path.join(outputDir, filename);
            fs.writeFileSync(outputPath, html);
            console.log(`Generated ${langConfig.path}${filename}`);
        });
    }
    
    console.log('Template build complete!');
}

// Run the build
buildPages().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
