// JSONFilter page specific imports
import './styles/main.css';

// Lazy load heavy dependencies to reduce initial bundle size
async function loadJSONPathFilter() {
  // Dynamically import CodeMirror and its dependencies
  await Promise.all([
    import('codemirror/mode/javascript/javascript' as any),
    import('codemirror/addon/fold/foldcode' as any),
    import('codemirror/addon/fold/foldgutter' as any),
    import('codemirror/addon/fold/brace-fold' as any),
    import('codemirror/addon/fold/indent-fold' as any),
    import('codemirror/addon/fold/comment-fold' as any),
  ]);

  // Dynamically import JSONPathFilter
  const { JSONPathFilter } = await import('./utils/JSONPathFilter');
  return JSONPathFilter;
}

// Initialize the JSON filter page only with performance optimization
const initializeApp = async () => {
  // Only initialize if we're on the JSONFilter page (check for JSONFilter specific element)
  if (document.getElementById('jsonFilterInput')) {
    // Use requestIdleCallback for non-critical initialization if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        const JSONPathFilter = await loadJSONPathFilter();
        new JSONPathFilter();
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(async () => {
        const JSONPathFilter = await loadJSONPathFilter();
        new JSONPathFilter();
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
