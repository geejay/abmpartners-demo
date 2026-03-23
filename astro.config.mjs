// @ts-check
import {defineConfig, passthroughImageService} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import alpinejs from "@astrojs/alpinejs";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare"

// https://astro.build/config
export default defineConfig({
	site: "https://pawstronaut.netlify.app",
	base: "/",
	integrations: [
		(await import("@playform/inline")).default(),
		alpinejs(),
		mdx(),
	],
	output: "static",
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
