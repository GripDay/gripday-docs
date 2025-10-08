import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "IQKV Foundation",
  description:
    "Free, open-source, API-first, headless platform built using Spring Boot, Kafka, Postgresql, and ReactJs.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Overview", link: "/overview" },
    ],

    sidebar: [
      {
        text: "Main",
        items: [
          { text: "Project Overview", link: "/overview" },
          { text: "Requirements", link: "/requirements" },
          { text: "Support", link: "/support" },
          { text: "Contributing Guide", link: "/contributing" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/IQKV/standard-docs-vitepress-project-layout",
      },
    ],
  },
});
