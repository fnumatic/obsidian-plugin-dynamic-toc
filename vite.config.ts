import { defineConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'module'

export default defineConfig({
  resolve: {
    alias: {
      'src': resolve(import.meta.dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js',
      cssFileName: 'styles'
    },
    rollupOptions: {
      external: [
        'obsidian',
        'electron',
        'codemirror',
        '@codemirror/autocomplete',
        '@codemirror/closebrackets',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/comment',
        '@codemirror/fold',
        '@codemirror/gutter',
        '@codemirror/highlight',
        '@codemirror/history',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/matchbrackets',
        '@codemirror/panel',
        '@codemirror/rangeset',
        '@codemirror/rectangular-selection',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/stream-parser',
        '@codemirror/text',
        '@codemirror/tooltip',
        '@codemirror/view',
        '@lezer/common',
        '@lezer/lr',
        ...builtinModules
      ],
      output: {
        entryFileNames: 'main.js',
        exports: 'named'
      }
    },
    target: 'esnext',
    sourcemap: false,
    emptyOutDir: true
  },
  css: {
    // This will handle any CSS imports in the TypeScript files
  }
})