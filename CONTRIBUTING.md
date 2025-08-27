# 🤝 Contributing to UniBay

Thank you for your interest in contributing to UniBay! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- A GitHub account
- Basic knowledge of React, Node.js, and MongoDB

### Setup Development Environment
1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies
4. **Set up** environment variables
5. **Start** development servers

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/UniBay.git
cd UniBay

# Install dependencies
npm install
cd backend && npm install && cd ..

# Set up environment (copy from examples)
cp env.production.example .env.local
cp backend/env.production.example backend/config.env

# Start development
npm run dev  # Frontend
cd backend && npm run dev  # Backend
```

## 📋 Contribution Guidelines

### Code Style
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript-like prop types for React components

### Commit Messages
Use conventional commit format:
```
type(scope): description

Examples:
feat(auth): add OAuth login support
fix(chat): resolve message display issue
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(api): optimize database queries
test(auth): add unit tests for login
```

### Pull Request Process
1. **Create** a feature branch from `main`
2. **Make** your changes
3. **Test** thoroughly
4. **Update** documentation if needed
5. **Submit** a pull request with clear description

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Local testing completed
- [ ] All tests pass
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🏗️ Project Structure

### Frontend (`src/`)
```
src/
├── components/        # Reusable UI components
├── contexts/          # React contexts
├── ecommerce/         # Marketplace features
├── chatSystem/        # Chat functionality
├── ProductDetails/    # Product pages
├── authentication/    # Auth components
└── utils/            # Utility functions
```

### Backend (`backend/`)
```
backend/
├── models/           # MongoDB schemas
├── routes/           # API endpoints
├── middleware/       # Custom middleware
├── utils/            # Utility functions
└── config.env        # Environment variables
```

## 🧪 Testing

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Backend Testing
```bash
cd backend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🐛 Bug Reports

### Before Submitting
1. **Check** existing issues
2. **Reproduce** the bug
3. **Check** browser console for errors
4. **Verify** environment setup

### Bug Report Template
```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 22]

## Additional Context
Screenshots, logs, or other relevant information
```

## 💡 Feature Requests

### Before Submitting
1. **Check** existing feature requests
2. **Consider** if it aligns with project goals
3. **Think** about implementation complexity
4. **Discuss** in issues before coding

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Screenshots, mockups, or examples
```

## 📚 Documentation

### What to Document
- New features and their usage
- API endpoints and parameters
- Configuration options
- Troubleshooting guides
- Performance considerations

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep documentation up-to-date
- Use consistent formatting

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- **Email** security@unibay.com with details
- **Include** reproduction steps
- **Wait** for response before disclosure

### Security Best Practices
- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Implement proper authentication
- Follow OWASP guidelines

## 🎯 Areas for Contribution

### High Priority
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Testing coverage

### Medium Priority
- [ ] UI/UX improvements
- [ ] Documentation updates
- [ ] Code refactoring
- [ ] New features
- [ ] Bug fixes

### Low Priority
- [ ] Code style improvements
- [ ] Minor UI tweaks
- [ ] Documentation formatting
- [ ] Performance monitoring

## 🏆 Recognition

### Contributors Hall of Fame
- **Gold Contributors**: 10+ significant contributions
- **Silver Contributors**: 5+ contributions
- **Bronze Contributors**: 1+ contribution

### How to Get Recognized
- Submit quality pull requests
- Help with documentation
- Report and fix bugs
- Participate in discussions
- Help other contributors

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **Email**: support@uniBay.com for general support

### Before Asking for Help
1. **Check** existing documentation
2. **Search** existing issues
3. **Try** to solve the problem yourself
4. **Provide** clear, detailed information

## 🙏 Thank You

Thank you for contributing to UniBay! Your contributions help make campus commerce better for students worldwide.

---

**Remember**: Every contribution, no matter how small, makes a difference! 🚀
