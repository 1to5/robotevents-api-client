# Project Description
This project provides a wrapper for the RoboEvents API. It generates a private npm package from the swagger.yml specification, using fetch to maintain cross-environment compatibility (frontend & backend). Caching mechanisms are implemented to enhance API client performance and security.

# Coding Sytle
- Use ES Modules (import/export) syntax instead of CommonJS (require)
- Prefer destructured imports (e.g., import { foo } from 'bar') where possible

# Workflow
- Always run type checks after a series of code changes
- For performance, prioritize running single tests over the entire test suite

# Development Philosophy

## Core Principle: **Less is more**
Keep every implementation as small and obvious as possible. Make it simple, easy to maintain and robust.

## Guidelines
- **Simplicity first** – Prefer the simplest data structures and APIs that work
- **Avoid needless abstractions** – Refactor only when duplication hurts
- **Remove dead code early** – scans for unused files/deps and lets you delete them in one command
- **Minimize dependencies** – Before adding a dependency, ask "Can we do this with what we already have?"
- **Consistency wins** – Follow existing naming and file-layout patterns; if you must diverge, document why
- **Explicit over implicit** – Favor clear, descriptive names and type annotations over clever tricks
- **Fail fast** – Validate inputs, throw early, and surface actionable errors
- **Let the code speak** – If you need a multi-paragraph comment, refactor until intent is obvious
- **Learn before building** – If a technology is unfamiliar, use context7 to search its docs first.



# Language Support
- Some core members are non‑native English speakers.
- Please correct grammar in commit messages, code comments, and PR discussions.
- Rewrite unclear user input when necessary to ensure smooth communication.
