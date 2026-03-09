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

```shell script
# Clone the repository
git clone https://github.com/GripDay/gripday-docs.git my-docs

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
| `pnpm formatter:write` | Run Prettier over the code |
| `pnpm lint`           | Lint code                  |

### Environment Variables

| Variable   | Description                | Default       |
| ---------- | -------------------------- | ------------- |
| `NODE_ENV` | Defines nodejs environment | `development` |

---

## 📆 Changelog

Conventional changelog located [here](CHANGELOG.md).

## 👍 Acknowledgments

...

## 🙏 Community & Contributions

Please follow [Contributing](.github/CONTRIBUTING.md) page.

## 📙 Code of Conduct

Please follow [Code of Conduct](.github/CODE_OF_CONDUCT.md) page.

## 💥 Troubleshooting

...

## 📑 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
