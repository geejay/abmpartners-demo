// @ts-check
import {defineConfig, passthroughImageService} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import alpinejs from "@astrojs/alpinejs";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://abmpartners.com.au",
	base: "/",
	integrations: [
		(await import("@playform/inline")).default(),
		alpinejs(),
		mdx(),
		sitemap(),
	],
	output: "server",
	devToolbar: {
		enabled: false,
	},
	vite: {
		plugins: [tailwindcss()],
	},
	image: {
		service: passthroughImageService()
	},
	adapter: cloudflare()
});
