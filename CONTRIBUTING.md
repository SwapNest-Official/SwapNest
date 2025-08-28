# Contributing to SwapNest

Thank you for your interest in contributing to SwapNest! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### **Types of Contributions**

We welcome various types of contributions:

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Improve our docs and guides
- 🎨 **UI/UX Improvements**: Enhance the user interface
- 🧪 **Testing**: Help test features and report bugs
- 🔧 **Code Contributions**: Submit pull requests with code changes

### **Before You Start**

1. **Check Existing Issues**: Look through existing issues and pull requests
2. **Read Documentation**: Familiarize yourself with the project structure
3. **Join Discussions**: Participate in GitHub Discussions for questions

## 🚀 Development Setup

### **Prerequisites**

- Node.js 18+ 
- npm or yarn
- Git
- Firebase account (for testing)

### **Local Development**

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SwapNest.git
   cd SwapNest
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📝 Making Changes

### **Code Style Guidelines**

- **React**: Use functional components with hooks
- **JavaScript**: Use ES6+ features, avoid var
- **CSS**: Use Tailwind CSS classes, avoid custom CSS when possible
- **Naming**: Use descriptive names, follow camelCase for variables

### **Commit Message Format**

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(chat): add real-time message notifications
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(ui): improve button hover effects
```

### **Pull Request Process**

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, readable code
   - Add tests if applicable
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push to Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use the PR template
   - Describe changes clearly
   - Link related issues
   - Request reviews from maintainers

## 🧪 Testing

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Testing Guidelines**

- Write tests for new features
- Ensure existing tests pass
- Test on multiple devices/browsers
- Test both light and dark themes

## 📚 Documentation

### **Documentation Standards**

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep documentation up-to-date

### **Documentation Areas**

- README.md
- Component documentation
- API documentation
- Deployment guides
- Contributing guidelines

## 🐛 Reporting Issues

### **Bug Report Template**

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 22]

## Screenshots
If applicable, add screenshots

## Additional Context
Any other context about the problem
```

### **Feature Request Template**

```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Any other context or screenshots
```

## 🔍 Code Review Process

### **Review Guidelines**

- Be constructive and respectful
- Focus on code quality and functionality
- Suggest improvements when possible
- Approve only when satisfied

### **Review Checklist**

- [ ] Code follows project style guidelines
- [ ] Functionality works as expected
- [ ] Tests pass and coverage is adequate
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## 🏷️ Labels and Milestones

### **Issue Labels**

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: High priority issues
- `priority: low`: Low priority issues

### **Pull Request Labels**

- `ready for review`: Ready for maintainer review
- `work in progress`: Still being worked on
- `needs review`: Requires code review
- `approved`: Approved by maintainers

## 🎯 Project Goals

### **Current Focus Areas**

- **Performance**: Improve loading times and responsiveness
- **Accessibility**: Ensure WCAG compliance
- **Mobile Experience**: Optimize for mobile devices
- **Testing**: Increase test coverage
- **Documentation**: Improve developer experience

### **Long-term Vision**

- **Scalability**: Handle larger user bases
- **Internationalization**: Support multiple languages
- **Advanced Features**: AI-powered recommendations
- **Mobile App**: Native mobile applications

## 📞 Getting Help

### **Communication Channels**

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions
- **Email**: [Your Email] for private matters

### **Community Guidelines**

- Be respectful and inclusive
- Help others when possible
- Share knowledge and experiences
- Follow the project's code of conduct

## 🙏 Recognition

### **Contributor Recognition**

- Contributors are listed in the README
- Significant contributions are highlighted
- Regular contributors may become maintainers
- All contributors are appreciated and valued

### **Contributor Types**

- **Contributors**: Anyone who contributes code or documentation
- **Maintainers**: Regular contributors with merge access
- **Reviewers**: Contributors who help review code
- **Users**: People who use and provide feedback

---

**Thank you for contributing to SwapNest!** 🎉

Your contributions help make this project better for everyone in the campus community.
