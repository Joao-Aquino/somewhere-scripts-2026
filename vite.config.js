import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Modo "lib" (biblioteca) = gera um único arquivo JS auto-executável
    lib: {
      entry: resolve(__dirname, 'src/global.js'),
      name: 'SomewhereBundle',
      // IIFE = Immediately Invoked Function Expression
      // (função que executa sozinha assim que o script carrega — igual o Odyn fazia)
      formats: ['iife'],
      fileName: () => 'bundle.js',
    },
    rollupOptions: {
      output: {
        // Junta TODOS os import() dinâmicos dentro do bundle.js
        // (sem chunks separados, sem requests HTTP extras)
        inlineDynamicImports: true,
        // CSS sempre sai como "bundle.css"
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'bundle.css';
          return '[name][extname]';
        },
      },
    },
    // CSS também concatenado em um único bundle.css
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    // Target moderno para suportar sintaxe recente sem transpilação agressiva
    target: 'es2020',
  },
});