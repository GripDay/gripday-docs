> ## 🤔 What is this template all about?
>
> - This template can be used as a base layer for a GitHub profile page.
> - Make the project easy to maintain with **7 issue templates**.
> - Quick-start documentation with an extraordinary README structure.
> - Manage issues with **20 issue labels**.
> - Make _community healthier_ with all the guides like code of conduct, contributing, support, security...
> - Learn more with the [official GitHub guide on creating repositories from a template](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template).
> - To start using it, click **[Use this template](https://github.com/IQKV/standard-docs-vitepress-project-layout/generate)** to create your new repository.

---

<!-- CUT HERE -->

# ✨ Documentation

Getting-started guidance, feature details, and API reference documentation.

### Getting Started

> [!TIP]
>
> #### Install Prerequisites:
>
> - [Node LTS version](https://nodejs.org/en/blog/release/v22.15.0/)
> - [pnpm](https://pnpm.io/installation)
> - [Git](https://git-scm.com/)
> - [Docker](https://www.docker.com/get-started/)
> - [Docker Compose](https://docs.docker.com/compose/)

```shell script
# Clone the repository
git clone https://github.com/IQKV/standard-docs-vitepress-project-layout.git my-docs

# Navigate to project directory
cd my-docs

# Install dependencies
pnpm install

# Start development server
pnpm docs:dev
```

### Available Scripts

| Command               | Description                |
| --------------------- | -------------------------- |
| `pnpm docs:dev`       | Start development server   |
| `pnpm docs:build`     | Build for production       |
| `pnpm docs:preview`   | Preview production build   |
| `pnpm prettier:write` | Run Prettier over the code |
| `pnpm lint`           | Lint code                  |

### Environment Variables

| Variable   | Description                | Default       |
| ---------- | -------------------------- | ------------- |
| `NODE_ENV` | Defines nodejs environment | `development` |

---

<a name="changelog"></a>

## 📆 Changelog

Conventional changelog located [here](CHANGELOG.md).

<a name="acknowledgments"></a>

## 👍 Acknowledgments

...

<a name="contributing"></a>

## 🙏 Community & Contributions

Please follow [Contributing](.github/CONTRIBUTING.md) page.

<a name="codeofconduct"></a>

## 📙 Code of Conduct

Please follow [Code of Conduct](.github/CODE_OF_CONDUCT.md) page.

<a name="troubleshooting"></a>

## 💥 Troubleshooting

...

## 📑 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## <!-- CUT HERE -->

## _GitHub Project Tooling Overview_

### **Core Framework & Build Tools**

- **VitePress** - Static site generator for documentation
- **Vue** - Frontend framework
- **pnpm** - Package manager with workspace support

### **Development Scripts**

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `pnpm docs:dev`       | Start development server       |
| `pnpm docs:build`     | Build for production           |
| `pnpm docs:preview`   | Preview production build       |
| `pnpm prettier:write` | Format code with Prettier      |
| `pnpm lint`           | Lint code (prettier check)     |
| `pnpm release`        | Create release with release-it |

### **Code Quality & Formatting**

- **Prettier** - Code formatting with packagejson plugin
- **Lint-staged** - Run linters on staged files
- **EditorConfig** - Consistent editor settings

### **Git Workflow & Automation**

- **Husky** - Git hooks management
- **Commitlint** - Enforce conventional commits
- **Commitizen** - Interactive commit message generator
- **Pre-commit hooks** - Automatic code formatting before commits

### **Release Management**

- **Release-it** - Automated release workflow
- **Conventional Changelog** - Generate changelog from commits
- **Release-it-pnpm** - pnpm integration for releases

### **GitHub Workflow Automation**

- **Build validation** - Node.js project build checks
- **PR title validation** - Enforce conventional PR titles
- **Commit message validation** - Verify commit format
- **Template cleanup** - Post-template setup automation
- **Dependabot** - Automated dependency updates

### **Community & Documentation**

- **Issue templates** (7 templates) - Standardized issue reporting
- **Issue labels** (20 labels) - Organized issue categorization
- **Community health files** - Contributing, CoC, Security, Support guides
- **Dev container** - Containerized development environment
