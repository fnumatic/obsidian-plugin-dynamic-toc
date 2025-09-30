# Agent Guidelines for Obsidian Dynamic TOC Plugin

## Build Commands
- Build: `npm run build` or `pnpm build`
- Type check: `npm run type-check` or `pnpm type-check`
- Dev: `npm run dev` or `pnpm dev`

## Test Commands
- Run all tests: `npm test` or `pnpm test`
- Run tests in watch mode: `npm run test:watch` or `pnpm test:watch`
- Run single test: `npm test -- --testNamePattern="test name"` or `pnpm test -- --testNamePattern="test name"`
- Run specific test file: `npm test path/to/test.js` or `pnpm test path/to/test.js`

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled: `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`
- Target ES6, module ESNext
- Use explicit types for function parameters and return values

### Imports
- External libraries first (obsidian, etc.)
- Internal imports grouped by relative path depth
- Use named imports over default imports when possible

### Naming Conventions
- Variables/functions: camelCase
- Classes/types/interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case.ts

### Code Patterns
- Functional programming with native JavaScript methods
- Optional chaining (`?.`) for null safety
- Template literals for string interpolation
- No semicolons at statement ends
- Arrow functions preferred for callbacks
- Early returns for error conditions

### Error Handling
- Defensive programming with null/undefined checks
- Use try-catch only when necessary
- Return empty arrays/objects instead of null for collections

### Testing
- Vitest framework
- Describe/it structure for test organization
- Mock external dependencies in `__mocks__` directory
- Snapshot testing for complex outputs