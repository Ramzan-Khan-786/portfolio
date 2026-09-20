import { readdir, readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./node_modules/pdfjs-dist/', import.meta.url));
const folders = ['cmaps', 'standard_fonts', 'wasm'];
export default function pdfAssetsPlugin() {
  return {
    name: 'portfolio-local-pdf-assets',
    configureServer(server) {
      server.middlewares.use('/pdfjs-assets', (req, res, next) => {
        const match = /^\/(cmaps|standard_fonts|wasm)\/([a-zA-Z0-9_.-]+)$/.exec((req.url || '').split('?')[0]);
        if (!match) return next();
        const stream = createReadStream(root + match[1] + '/' + match[2]);
        stream.on('error', () => { if (!res.headersSent) res.statusCode = 404; res.end(); });
        res.setHeader('Content-Type', match[2].endsWith('.wasm') ? 'application/wasm' : /\.m?js$/.test(match[2]) ? 'text/javascript' : 'application/octet-stream');
        stream.pipe(res);
      });
    },
    async generateBundle() {
      for (const folder of folders) for (const name of await readdir(root + folder)) {
        if (name === 'LICENSE') continue;
        this.emitFile({ type: 'asset', fileName: 'pdfjs-assets/' + folder + '/' + name, source: await readFile(root + folder + '/' + name) });
      }
    },
  };
}
