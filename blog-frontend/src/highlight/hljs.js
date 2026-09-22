import hljs from 'highlight.js';
import freedesktop from './languages/freedesktop';
import 'highlight.js/styles/base16/github.css';

// Custom language from the gg582/highlight.js fork. Blog posts also use the
// "desktop" fence name for XDG shortcut files.
hljs.registerLanguage('freedesktop', freedesktop);
hljs.registerAliases('desktop', { languageName: 'freedesktop' });

export default hljs;
