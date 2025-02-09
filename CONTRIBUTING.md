# Contributing to Padded Grid

We love your input! We want to make contributing to Padded Grid as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

All changes happen through pull requests. Pull requests are the best way to propose changes to the codebase.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build package
bun run build

# Lint code
bun run lint
```

## Project Structure

```
src/
├── lib/              # Main library code
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
└── demo/             # Demo application
```

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the CHANGELOG.md with a note describing your changes
3. The PR will be merged once you have the sign-off of the maintainers

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the
same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the
maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/dnvt/baseline-kit/issues)

We use GitHub issues to track public bugs. Report a bug
by [opening a new issue](https://github.com/dnvt/baseline-kit/issues/new).

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines
for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md).
