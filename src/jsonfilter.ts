// JSONFilter page specific imports
import './styles/main.css';

// Import CodeMirror modes needed for JSONFilter page
import 'codemirror/mode/javascript/javascript';

// Import CodeMirror addons for code folding
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/comment-fold';

// Import utility classes specific to JSONFilter page
import { JSONPathFilter } from './utils/JSONPathFilter';

// Initialize the JSON filter page only
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the JSONFilter page (check for JSONFilter specific element)
  if (document.getElementById('jsonFilterInput')) {
    console.log('Initializing JSONPathFilter for jsonfilter page');
    new JSONPathFilter();
  }
});
