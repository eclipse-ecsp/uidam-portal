# UIDAM Portal v1.0.0

**Release Date:** December 19, 2025

First public release of UIDAM Portal - a modern web administration interface for User Identity and Access Management, part of Eclipse ECSP.

## 🎯 Highlights

Complete, production-ready admin portal built with React 18, TypeScript, and Material-UI. Provides comprehensive management capabilities for users, roles, permissions, and OAuth2 clients in the UIDAM ecosystem.

## ⭐ New Features

### Identity & Access Management
- **User Management** - Create, update, and manage users with account assignments and approval workflow
- **Account Management** - Organize users into logical account structures with role mappings
- **Role Management** - Define custom roles with scope-based permissions
- **Scope Management** - Manage fine-grained permission scopes across the system
- **User Approval Workflow** - Review and approve new user registrations

### OAuth2 & Security
- **OAuth2 Client Management** - Register and configure OAuth2 clients with full grant type support
  - Grant Types: Authorization Code, Client Credentials, Refresh Token, Implicit
  - Authentication Methods: Client Secret Basic, Client Secret POST, None
  - Custom token validity periods
- **Secure Authentication** - OAuth2 integration with UIDAM Authorization Server
- **Role-Based Access Control** - Fine-grained permissions and protected routes

### User Experience
- **Dashboard** - Real-time system metrics and quick actions
- **AI Assistant (Beta)** - Contextual help for administrative tasks
- **Modern UI** - Material-UI components with dark/light theme support

## 🚀 Installation

**Prerequisites:**
- Node.js 18+ and npm 9+
- UIDAM backend services (User Management + Authorization Server)

**Development:**
```bash
npm install
cp .env.example .env  # Configure backend URLs
npm run dev
```

**Production Docker:**
```bash
docker build -t uidam-portal:1.0.0 .
docker run -p 8080:80 uidam-portal:1.0.0
```

Access at `http://localhost:8080`

## 📦 What's Included

**Tech Stack:**
- React 18.2.0 with TypeScript 5.2.2
- Material-UI 5.15.0 for components
- Redux Toolkit 2.0.1 for state
- TanStack Query 5.14.2 for data fetching
- Vite 5.0.8 for builds
- Jest 29.7.0 (70%+ coverage)

**Production Ready:**
- Docker + nginx deployment
- Environment-based configuration  
- ESLint + Prettier
- SonarQube integration
- Eclipse Dash license compliance

## � Requirements

- Node.js 18+ | npm 9+
- UIDAM backend services ([User Management](https://github.com/eclipse-ecsp/uidam-user-management) + [Authorization Server](https://github.com/eclipse-ecsp/uidam-authorization-server))
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 📚 Documentation

[README](https://github.com/eclipse-ecsp/uidam-portal#readme) • [Contributing](https://github.com/eclipse-ecsp/uidam-portal/blob/main/CONTRIBUTING.md) • [Security](https://github.com/eclipse-ecsp/uidam-portal/blob/main/SECURITY.md) • [Full Release Notes](https://github.com/eclipse-ecsp/uidam-portal/blob/main/RELEASE_NOTES.md)

## 🔐 Security

✅ OAuth2 authentication • XSS/CSRF protection • SonarQube scanned • License compliant

Report vulnerabilities: [SECURITY.md](https://github.com/eclipse-ecsp/uidam-portal/blob/main/SECURITY.md)

## 💬 Get Help

[Report Issues](https://github.com/eclipse-ecsp/uidam-portal/issues) • [Discussions](https://github.com/eclipse-ecsp/uidam-portal/discussions)

---

**License:** Apache 2.0 | **Contributors:** Harman International → Eclipse ECSP

**Full Changelog**: https://github.com/eclipse-ecsp/uidam-portal/commits/main
