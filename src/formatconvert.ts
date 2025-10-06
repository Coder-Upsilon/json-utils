// Format conversion page specific imports
import './styles/main.css';

// Lazy load heavy dependencies to reduce initial bundle size
async function loadFormatConverter() {
  // Dynamically import CodeMirror and its dependencies
  await Promise.all([
    import('codemirror/mode/javascript/javascript' as any),
    import('codemirror/mode/yaml/yaml' as any),
    import('codemirror/mode/xml/xml' as any),
    import('codemirror/addon/fold/foldcode' as any),
    import('codemirror/addon/fold/foldgutter' as any),
    import('codemirror/addon/fold/brace-fold' as any),
    import('codemirror/addon/fold/indent-fold' as any),
    import('codemirror/addon/fold/comment-fold' as any),
  ]);

  // Dynamically import FormatConverter
  const { FormatConverter } = await import('./utils/FormatConverter');
  return FormatConverter;
}

// Initialize the format conversion page only with performance optimization
const initializeApp = async () => {
  // Only initialize if we're on the format conversion page
  if (document.getElementById('jsonInput') && document.getElementById('inputFormat')) {
    // Use requestIdleCallback for non-critical initialization if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        const FormatConverter = await loadFormatConverter();
        new FormatConverter();
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(async () => {
        const FormatConverter = await loadFormatConverter();
        new FormatConverter();
      }, 0);
    }
  }
};

// Use different loading strategies based on document state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Document already loaded
  initializeApp();
}
