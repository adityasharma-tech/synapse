# Synapse

A real-time streaming and chat platform with premium chat features, secure payments, and user authentication.

## Project Structure

This project uses a monorepo architecture managed with Turborepo for optimal development workflow.

```
synapse/
├── apps/
│   ├── web/          # React frontend
│   └── server/       # Node.js backend
├── packages/
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configurations
│   └── zod-client/   # Type validation
```

## Technologies

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express
- **Architecture**: Monorepo (Turborepo)
- **Authentication**: JWT, Google SSO
- **Payment Integration**: RazorPay, Cashfree
- **Real-time Communication**: WebSocket
- **Database**: PostgreSQL, Redis
- **Message Queue**: RabbitMQ
- **Container**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**:
    - ESLint
    - Prettier
    - Commitlint (Conventional Commits)
    - Husky (Git Hooks)
- **Testing**: Jest, React Testing Library

## Features

## Features

- 🔐 Secure authentication with email/password and Google SSO
- 💰 Premium chat system with integrated payments
- 🎥 Live streaming capabilities
- 🌓 Dark/Light mode support
- 📊 Upvote/downvote system for chats
- 👥 Streamer application and verification process
- 💬 Real-time chat with typing indicators

## Installation

1. Clone the repository
2. Install dependencies:

```sh
npm install
```

3. Create `.env` file based on `.env.sample`
4. Run using Docker:

```sh
docker-compose up -d
```

Or start development server:

```sh
npm run dev
```

The app will be available at http://localhost:5174

## Development

### Prerequisites

- Node.js >= 18
- Docker and Docker Compose
- pnpm (recommended) or npm

### Scripts

```sh
# Build all packages
npm run build

# Run development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation updates
style: code style updates
refactor: code refactoring
test: test updates
chore: routine tasks
```

### Docker Support

The application includes production-ready Dockerfiles and Docker Compose configuration for easy deployment:

```sh
# Build and run containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Contact

For questions or support, please reach out to the repository maintainers.

The app uses TailwindCSS for styling and follows modern React best practices with TypeScript. See the individual source files for more implementation details.
