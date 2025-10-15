import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "GripDay Platform",
  description:
    "Open-Core B2B Marketing Automation Platform - Enterprise-grade microservices architecture built with Java 25, Spring Boot 3, and React 19.",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#3c82f6" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "en" }],
    [
      "meta",
      {
        property: "og:title",
        content: "GripDay Platform | Open-Core B2B Marketing Automation",
      },
    ],
    ["meta", { property: "og:site_name", content: "GripDay Platform" }],
    ["meta", { property: "og:url", content: "https://docs.gripday.com/" }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",
    siteTitle: "GripDay Platform",

    nav: [
      { text: "Home", link: "/" },
      { text: "Overview", link: "/overview" },
      {
        text: "Architecture",
        items: [
          { text: "System Design", link: "/architecture/system-design" },
          { text: "Microservices", link: "/architecture/microservices" },
          { text: "Database Design", link: "/architecture/database" },
          { text: "Security", link: "/architecture/security" },
        ],
      },
      {
        text: "Development",
        items: [
          { text: "Getting Started", link: "/development/getting-started" },
          { text: "Local Setup", link: "/development/local-setup" },
          { text: "API Reference", link: "/development/api-reference" },
          { text: "Contributing", link: "/development/contributing" },
        ],
      },
      {
        text: "Business",
        items: [
          { text: "Business Case", link: "/business/presentation" },
          { text: "Market Analysis", link: "/business/market-analysis" },
          { text: "Brand Strategy", link: "/business/brand-strategy" },
        ],
      },
    ],

    sidebar: {
      "/": [
        {
          text: "Getting Started",
          collapsed: false,
          items: [
            { text: "Project Overview", link: "/overview" },
            { text: "Quick Start", link: "/quick-start" },
            { text: "Installation", link: "/installation" },
          ],
        },
        {
          text: "Architecture",
          collapsed: false,
          items: [
            { text: "System Design", link: "/architecture/system-design" },
            {
              text: "Microservices Architecture",
              link: "/architecture/microservices",
            },
            { text: "Database Design", link: "/architecture/database" },
            {
              text: "Event-Driven Architecture",
              link: "/architecture/event-driven",
            },
            { text: "Security Architecture", link: "/architecture/security" },
            {
              text: "Deployment Architecture",
              link: "/architecture/deployment",
            },
          ],
        },
        {
          text: "Requirements",
          collapsed: false,
          items: [
            {
              text: "Functional Requirements",
              link: "/requirements/functional",
            },
            {
              text: "Non-Functional Requirements",
              link: "/requirements/non-functional",
            },
            { text: "MVP Requirements", link: "/requirements/mvp" },
          ],
        },
        {
          text: "Development",
          collapsed: false,
          items: [
            { text: "Getting Started", link: "/development/getting-started" },
            { text: "Local Development", link: "/development/local-setup" },
            { text: "Docker Setup", link: "/development/docker-setup" },
            { text: "Kubernetes Setup", link: "/development/kubernetes-setup" },
            { text: "API Reference", link: "/development/api-reference" },
            { text: "Testing Guide", link: "/development/testing" },
          ],
        },
        {
          text: "Business",
          collapsed: true,
          items: [
            { text: "Business Presentation", link: "/business/presentation" },
            { text: "Market Analysis", link: "/business/market-analysis" },
            {
              text: "Competitive Analysis",
              link: "/business/competitive-analysis",
            },
            { text: "Brand Strategy", link: "/business/brand-strategy" },
            { text: "Open-Core Model", link: "/business/open-core-model" },
          ],
        },
        {
          text: "Project Management",
          collapsed: true,
          items: [
            { text: "MVP Roadmap", link: "/project/mvp-roadmap" },
            { text: "Sprint Planning", link: "/project/sprint-planning" },
            { text: "Development Status", link: "/project/status" },
          ],
        },
        {
          text: "Community",
          collapsed: true,
          items: [
            { text: "Contributing Guide", link: "/contributing" },
            { text: "Code of Conduct", link: "/code-of-conduct" },
            { text: "Support", link: "/support" },
            { text: "Changelog", link: "/changelog" },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/gripday/gripday-platform",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024 GripDay Platform",
    },

    editLink: {
      pattern:
        "https://github.com/gripday/gripday-platform/edit/main/docs/:path",
    },

    search: {
      provider: "local",
    },
  },
  ignoreDeadLinks: [/^https?:\/\/localhost/],
});
