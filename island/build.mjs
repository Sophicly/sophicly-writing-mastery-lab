// Build the Scene Selection island → ../frontend/wml-scene-island.min.js
// The output is COMMITTED (like wml-tiptap.min.js) — the server never builds.
import * as esbuild from 'esbuild';

const res = await esbuild.build({
    entryPoints: ['src/index.jsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2019', 'safari14'],
    jsx: 'transform',
    define: { 'process.env.NODE_ENV': '"production"' },
    outfile: '../frontend/wml-scene-island.min.js',
    logLevel: 'info',
});
if (res.errors.length) process.exit(1);
