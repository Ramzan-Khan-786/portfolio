import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sources = [
  fileURLToPath(new URL('../shared/themes.js', import.meta.url)),
  fileURLToPath(new URL('./src/lib/themeStorage.js', import.meta.url)),
];

// These two controlled, side-effect-free modules use only named function/const
// exports. Inline their source, not Function.toString(), so Vite's config bundler
// cannot rename a captured binding and break the generated browser initializer.
function initializerSource() {
  const code = sources.map((path) => readFileSync(path, 'utf8')
    .replace(/^import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^export\s+(?=(?:const|function)\b)/gm, '')
  ).join('\n');
  return '(() => {\n' + code + '\ninitializeTheme();\n})();';
}

export default function themeBootPlugin() {
  return {
    name: 'portfolio-theme-initializer',
    buildStart() {
      for (const path of sources) this.addWatchFile(path);
    },
    transformIndexHtml(html) {
      // Keep charset first (within the first 1024 bytes), then initialize before
      // styles and the application. The marker is owned by index.html.
      return html.replace(
        '<!-- portfolio-theme-initializer -->',
        () => '<script>' + initializerSource() + '</script>',
      );
    },
  };
}
