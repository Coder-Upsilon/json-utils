// Main page specific imports
import './styles/main.css';

// Import CodeMirror modes needed for main page
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/xml/xml';

// Import CodeMirror addons for code folding
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/comment-fold';

// Import utility classes specific to main page
import { JSONUtils } from './utils/JSONUtils';

// Initialize the main JSON utils page only
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the main page (check for main page specific element)
  if (document.getElementById('jsonInput')) {
    console.log('Initializing JSONUtils for main page');
    new JSONUtils();
  }
});
