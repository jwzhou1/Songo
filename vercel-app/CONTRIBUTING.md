# Contributing to SonGo Enterprise Shipping Platform

Thank you for your interest in contributing to the SonGo Enterprise Shipping Platform! This document provides guidelines and information for contributors.

## 🎯 Project Overview

SonGo Enterprise is a comprehensive shipping management platform designed to showcase enterprise-level software engineering skills. It features:

- Multi-carrier shipping integration (FedEx, UPS, DHL, USPS)
- Real-time GPS tracking with Google Maps
- Secure payment processing with Stripe
- Modern React/Next.js architecture
- Enterprise-grade security and scalability

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- Git
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Next.js

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/songo-enterprise-shipping.git
   cd songo-enterprise-shipping/vercel-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

## 📋 Development Guidelines

### Code Style

We use ESLint and Prettier for consistent code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use strict type checking

### Component Structure

```typescript
// Component file structure
import React from 'react'
import { ComponentProps } from './types'

interface Props extends ComponentProps {
  // Component-specific props
}

export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default ComponentName
```

### Testing

- Write unit tests for all new components and functions
- Use React Testing Library for component tests
- Maintain test coverage above 70%
- Test both happy path and error scenarios

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔧 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── services/              # Business logic and API calls
├── types/                 # TypeScript type definitions
├── theme/                 # Material-UI theme configuration
├── utils/                 # Utility functions
└── hooks/                 # Custom React hooks
```

## 🎨 UI/UX Guidelines

### Design System

- Use Material-UI components consistently
- Follow the established color palette and typography
- Ensure responsive design for all screen sizes
- Maintain accessibility standards (WCAG 2.1 AA)

### Component Guidelines

- Create reusable components when possible
- Use proper semantic HTML
- Include proper ARIA labels and roles
- Test with screen readers

## 🔒 Security Guidelines

### API Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper error handling

### Data Handling

- Follow GDPR and privacy best practices
- Encrypt sensitive data
- Use HTTPS for all communications
- Implement proper authentication and authorization

## 📝 Commit Guidelines

We follow conventional commits for clear commit messages:

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Examples:
feat(tracking): add real-time GPS tracking
fix(payment): resolve Stripe payment validation
docs(readme): update installation instructions
```

## 🔄 Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **PR Requirements**
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - All tests passing
   - Code review approval

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: Any error messages

Use this template:

```markdown
## Bug Description
Brief description of the bug

## Environment
- OS: [e.g., Windows 11, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node.js: [e.g., 18.12.0]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

For new features, please:

1. Check existing issues to avoid duplicates
2. Provide clear use case and business value
3. Include mockups or wireframes if applicable
4. Consider implementation complexity
5. Be open to discussion and feedback

## 🏷️ Issue Labels

We use these labels to organize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to docs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority-high`: Critical issues
- `priority-medium`: Important issues
- `priority-low`: Nice to have

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

## 📞 Getting Help

- **Documentation**: Check the README and docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Email**: your.email@example.com for private matters

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- Special mentions in project updates

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SonGo Enterprise! Your efforts help make this project better for everyone. 🚚✨
