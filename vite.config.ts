import { resolve } from "path";

import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import type { OutputOptions } from "rollup";
import type { OutputBundle, OutputChunk } from "rollup";

const viteGoogleAppsScript = () => ({
  name: "vite-appscript-exports",
  generateBundle(outputOptions: OutputOptions, bundle: OutputBundle) {
    Object.values(bundle).forEach((bundleChunk) => {
      if (bundleChunk.type === "chunk") {
        const chunk = bundleChunk as OutputChunk;
        const isJavaScriptFile = chunk.fileName.endsWith(".js");
        const isValidChunk = chunk.type === "chunk" && chunk.code;
        const hasExports = chunk.exports?.length > 0;
        if (isJavaScriptFile && isValidChunk && hasExports) {
          const { name: libraryNamespace } = outputOptions;
          const globalFunctions = chunk.exports.map(
            (fnName) =>
              `const ${fnName} = (...args) => ${libraryNamespace}.${fnName}(...args);`
          );
          chunk.code = [chunk.code, ...globalFunctions].join("\n");
        }
      }
    });
  },
});

const targets = [
  { src: "node_modules/apps-script-oauth2/dist/OAuth2.gs", dest: "oauth2.js" },
  // { src: "src/html/*.html", dest: "." },
  { src: "appsscript.json", dest: "." },
];

export default defineConfig(({ mode }) => ({
  plugins: [viteGoogleAppsScript(), viteStaticCopy({ targets })],
  build: {
    minify: mode !== "development",
    outDir: resolve(process.cwd(), "dist"),
    lib: {
      entry: resolve(process.cwd(), "src/index.ts"),
      name: "app",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        extend: false,
        entryFileNames: "code.js",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
}));
