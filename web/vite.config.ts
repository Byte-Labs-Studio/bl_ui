import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	base: './', // fivem nui needs to have local dir reference
	resolve: {
		alias: {
			'@assets': resolve('./src/assets'),
			'@components': resolve('./src/components'),
			'@providers': resolve('./src/providers'),
			'@stores': resolve('./src/stores'),
			'@utils': resolve('./src/utils'),
			'@typings': resolve('./src/typings'),
			'@enums': resolve('./src/enums'),
			'@lib': resolve('./src/lib'),
			'@controllers': resolve('./src/controllers'),
		},
	},
	server: {
		port: 3000,
	},
	build: {
		emptyOutDir: true,
		outDir: '../build',
		assetsDir: './',
		rollupOptions: {
			output: {
				// By not having hashes in the name, you don't have to update the manifest, yay!
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`,
			},
		},
	},
});
