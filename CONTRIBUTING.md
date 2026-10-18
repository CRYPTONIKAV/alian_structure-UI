# Contributing to Alian Structure UI

Thank you for your interest in contributing to Alian Structure UI! This document provides guidelines and instructions to help you contribute effectively to this AI agent marketplace with a beautiful cosmic UI theme.

## 🚀 Tech Stack Overview

Before you begin, familiarize yourself with our core technologies:
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.3
- **UI Library**: Material UI (MUI) v9 with custom cosmic theme
- **Styling**: TailwindCSS 3.3 + Emotion
- **State Management**: Redux Toolkit + Zustand
- **Blockchain**: Stellar SDK + Freighter wallet integration
- **Data Fetching**: React Query + Axios
- **Search**: Algolia
- **Storage**: IPFS via nft.storage
- **Testing**: Jest + React Testing Library

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Git
- A Stellar testnet account (for blockchain features)
- An Algolia account (for search features, optional)

## 🛠️ Local Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/alian_structure-UI.git
cd alian_structure-UI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Edit `.env.local` with your API keys and configuration values.

`.env.example` is grouped by the feature that consumes each variable (API, Search,
Storage, Web push, Stellar, Version registry, Agent telemetry, Metrics, Build, Framework).
Every entry says whether it is required or optional and, when optional, the value the
code falls back to, so you only need to fill in what your work touches. Entries marked
`[SECRET]` must never be committed. A final **NOT IMPLEMENTED** section lists variables
that `README.md` still documents but no code reads — leave those alone unless you are
adding support for them.

When you add a `process.env` reference, add it to `.env.example` in the same commit. The
variable **names** can be checked mechanically:

```bash
comm -23 \
  <(grep -rhoE 'process\.env\.[A-Za-z_][A-Za-z0-9_]*' . \
       --include=*.ts --include=*.tsx --include=*.js --include=*.mjs --include=*.jsx \
       --exclude-dir=node_modules --exclude-dir=.next | sed 's/process\.env\.//' | sort -u) \
  <(grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' .env.example | tr -d '=' | sort -u)
```

An empty result means every name in the tree is present. It does **not** check the
descriptions, fallbacks or citations — those are maintained by hand, so if you touch a
variable's entry, confirm the fallback you wrote is character-for-character the `||`
operand in the source and that the cited `file:line` is where the read happens.

4. **Start the development server**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

5. **Run tests**
```bash
npm run test
```

6. **Run linting**
```bash
npm run lint
```

## 📝 Code Standards

### TypeScript
- Use strict TypeScript for all new files
- Define proper interfaces for all props and state
- Avoid `any` type - use `unknown` when necessary
- Leverage TypeScript's inference where possible

### React/Next.js
- Use functional components with hooks
- Follow Next.js App Router conventions
- Implement proper loading and error states
- Optimize for performance with React.memo, useMemo, and useCallback

### Styling
- Use TailwindCSS for utility classes
- Use MUI components for complex UI elements
- Maintain the cosmic theme consistency (colors: bg-cosmic-dark, text-white, etc.)
- Ensure responsive design works on all screen sizes

### Git Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or fixing tests
- `chore`: Build process or tooling changes

## 🧪 Testing Guidelines

- Write unit tests for all new features
- Maintain test coverage above 80%
- Test edge cases and error conditions
- Use React Testing Library for component tests
- Mock external API calls and blockchain interactions

## 🐛 Submitting Bug Reports

When reporting bugs, please include:
1. Steps to reproduce the issue
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser and operating system details
6. Console error messages

## ✨ Submitting Feature Requests

For new features, please:
1. Check if the feature is already in our ROADMAP.md
2. Provide a clear use case
3. Describe the proposed solution
4. Include mockups or sketches if possible
5. Discuss feasibility in a GitHub issue first

## 🔀 Pull Request Process

1. Create a feature branch from `main`
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes, following our code standards

3. Ensure all tests pass
```bash
npm run test
npm run lint
```

4. Commit your changes using conventional commits

5. Push to your fork and submit a pull request

6. Fill out the PR template completely

7. Wait for code review and address any feedback

## 🔒 Security

- Never commit API keys or secrets to the repository
- Report security vulnerabilities privately to the maintainers
- Follow security best practices for all new code
- Keep dependencies updated

## 📖 Documentation

- Update README.md for any user-facing changes
- Document new features in the appropriate places
- Add JSDoc comments for complex functions
- Update setup instructions if requirements change

## 💬 Community

- Join our discussions for questions and ideas
- Be respectful and inclusive (see CODE_OF_CONDUCT.md)
- Help others who are learning the codebase
- Share your use cases and feedback

Thank you for contributing to making Alian Structure UI a better platform! 🎉