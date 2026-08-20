# Contributing to Kudos Jaya

Thank you for your interest in contributing to Kudos Jaya! This guide will help you get set up and understand our development process.

## Development Setup

### Prerequisites

- Node.js 24.x or higher
- npm (comes with Node.js)
- PostgreSQL 12+
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jaya/kudos-jaya.git
   cd kudos-jaya
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Slack app credentials and database config
   ```

4. Initialize the database:
   ```bash
   npm run migration:up
   ```

5. Start development server:
   ```bash
   npm run start:local
   ```

The app will be available at `http://localhost:3000` with a mock server at `http://localhost:3001`.

## Code Style & Linting

We use ESLint and Prettier for code quality. Configuration is in `.eslintrc.js` and `.prettierrc`.

### Running Linters

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Prettier runs automatically on commit via husky
```

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for classes/types)
- Keep functions small and focused (max ~50 lines)
- Add comments only for "why", not "what" — let code be self-documenting
- Avoid `any` types; use proper TypeScript types

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring without feature changes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `chore:` Build/tooling changes
- `perf:` Performance improvements

### Examples

```
feat: add wallet balance check before kudos approval

Previously, users could give unlimited kudos. Now we enforce monthly limits.

Fixes #42
```

```
fix: handle timezone correctly for Brazil users

Replace moment.js timezone with native Date offset calculation.
```

## Testing

All new code requires tests. See [TESTING.md](docs/TESTING.md) for detailed guidelines.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/features/kudos/__tests__/give-kudos.service.test.ts

# Watch mode (re-run on file changes)
npm test -- --watch
```

### Test Coverage Requirements

- New code must maintain 100% test coverage on modified files
- Unit tests for services, controllers, utilities
- Integration tests for handlers and adapter combinations
- Always test error paths, not just happy paths

## Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and commit with conventional commit messages

3. Ensure all tests pass:
   ```bash
   npm test
   npm run lint
   ```

4. Push your branch:
   ```bash
   git push origin feat/my-feature
   ```

5. Open a pull request with:
   - Clear description of changes
   - Link to related issues
   - Summary of testing performed
   - Screenshots if UI changes

6. Address review feedback and re-request review

7. Squash commits if requested and merge

## Common Development Tasks

### Database Migrations

```bash
# Generate a new migration based on entity changes
npm run migration:gen -- <migration-name>

# Run all pending migrations
npm run migration:up

# Revert last migration
npm run migration:down
```

### Running in Watch Mode

```bash
npm run start:watch
```

This uses nodemon to restart the server when files change.

### Local Slack App Setup

1. Get ngrok URL:
   ```bash
   ngrok http 3000
   ```

2. Update `manifest.json` with ngrok URL

3. Update Slack App manifest at https://api.slack.com/apps

4. Install app to your workspace

## Project Structure

```
src/
├── features/              # Feature modules (one per feature)
│   ├── kudos/
│   ├── cancel-kudos/
│   ├── wallet/
│   ├── card-redemption/
│   ├── home-page/
│   ├── wallet-report/
│   └── prizes-report/
├── adapters/              # Platform abstractions
│   ├── interfaces/        # PlatformAdapter interfaces
│   ├── slack/             # Slack implementation
│   └── google-chat/       # Google Chat implementation
├── context/               # Dependency injection via RequestContext
├── controllers/           # Database access layer
├── api/                   # HTTP endpoints
├── listeners/             # Slack event listeners
├── types/                 # TypeScript type definitions
└── errors/                # Error hierarchy and handling
```

## Architecture Principles

- **Platform-Agnostic Services**: Services don't depend on Slack SDK
- **Adapter Pattern**: Handlers use `PlatformAdapter` instead of direct SDK calls
- **Feature Organization**: Handlers, services, types grouped by feature
- **Type Safety**: Strict TypeScript, no `any` types
- **Dependency Injection**: Via RequestContext, not parameter passing

See [ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) for detailed decisions.

## Questions?

- Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues
- Review existing code in similar features
- Open an issue for larger questions

Thank you for contributing! 🙏
