---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "GripDay Platform"
  text: "Open-Core B2B Marketing Automation"
  tagline: Enterprise-grade microservices platform built with Java 21, Spring Boot 3, and React 19. Free core modules with commercial premium features.
  image:
    src: assets/images/hero/hero-image.png
    alt: GripDay Platform Docs
  actions:
    - theme: brand
      text: Get Started
      link: /overview
    - theme: alt
      text: View Architecture
      link: /architecture/system-design
    - theme: alt
      text: Business Case
      link: /business/presentation

features:
  - icon: 🎯
    title: Open-Core Business Model
    details: Free core modules with optional commercial premium features. Sustainable business model funding continuous innovation without vendor lock-in.

  - icon: ⚡
    title: Modern Microservices Architecture
    details: Built with Java 21, Spring Boot 3, and React 19. Kubernetes-native deployment with event-driven communication via Apache Kafka.

  - icon: 🏢
    title: B2B Marketing Automation
    details: Specialized for complex B2B sales cycles with contact management, email marketing, campaign automation, and advanced lead scoring.

  - icon: 🔧
    title: Developer-First Platform
    details: Comprehensive REST APIs, extensive documentation, and plugin architecture. Built by developers for developers with modern tooling.

  - icon: 📊
    title: Enterprise-Grade Analytics
    details: Real-time dashboards, comprehensive reporting, and business intelligence. Track ROI and optimize marketing performance.

  - icon: 🔒
    title: Security & Compliance
    details: Enterprise-grade security with GDPR/CCPA compliance, role-based access control, and comprehensive audit logging.
---

## Why GripDay?

GripDay addresses a **$6.1B market opportunity** with **12.8% CAGR** growth by being the **first enterprise-grade open-core B2B marketing automation platform**. Unlike expensive proprietary solutions or unsustainable pure open-source projects, GripDay offers:

### 🎯 **For Individual Users & Small Teams**

- **Free core platform** provides essential marketing automation capabilities
- **No licensing fees** for basic functionality
- **Community support** and open-source transparency

### 🚀 **For Growing Businesses**

- **Commercial plugins** add advanced features as teams scale
- **Flexible pricing** based on actual feature usage
- **Professional support** options for business-critical implementations

### 🏗️ **For SaaS Businesses**

- **Open-core foundation** for building competitive marketing automation products
- **Sustainable business model** with clear monetization path
- **Platform extensibility** through modular architecture

### 🏢 **For Enterprise**

- **Full commercial suite** with advanced features and integrations
- **Enterprise support** with SLAs and dedicated account management
- **Custom development** services for specific business requirements

## Technology Stack

<div class="tech-stack">

**Backend**

- Java 21 with Virtual Threads
- Spring Boot 3.3+ with Spring Security 6
- Apache Kafka for event streaming
- PostgreSQL 16+ with CloudNativePG

**Frontend**

- React 19 with TypeScript
- Mantine UI component library
- Vite build tooling
- Feature-Sliced Design architecture

**Infrastructure**

- Kubernetes with Istio service mesh
- Docker containerization
- Prometheus + Grafana monitoring
- ELK Stack for centralized logging

</div>

## Quick Start

```bash
# Clone the repository
git clone https://github.com/GripDay/gripday.git
cd gripday-platform

# Start with Docker Compose (fastest)
./scripts/docker-dev.sh start

# Or use Kubernetes (production-like)
minikube start
./scripts/k8s-dev.sh deploy
```

Access the platform at `http://localhost:8080`

## Community & Support

- 📖 **Documentation**: Comprehensive guides and API reference
- 💬 **Community**: Join our discussions and get help
- 🐛 **Issues**: Report bugs and request features
- 🤝 **Contributing**: Help build the future of marketing automation

<style>
.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.tech-stack > div {
  padding: 1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
}
</style>
