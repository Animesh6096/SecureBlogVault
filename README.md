# SecureBlogVault

<p align="center">
  <img src="generated-icon.png" width="120" alt="SecureBlogVault Logo" />
</p>

<h1 align="center">🔒 SecureBlogVault</h1>
<p align="center">
  <b>A clean, minimalistic, and secure blog platform with modern design & robust encryption.</b>
</p>
<p align="center">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Animesh6096/SecureBlogVault?color=blue">
  <img alt="Node.js" src="https://img.shields.io/badge/node-%3E=18.0.0-green">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
</p>

## ✨ Features

- 🔑 **User Authentication** — Secure login with password hashing & salting
- 🛡️ **End-to-End Encryption** — All sensitive data is encrypted in storage
- 📝 **Admin Panel** — Manage blog posts with ease
- 📱 **Responsive UI** — Minimal, modern, and mobile-friendly design
- 🗄️ **Multi-DB Support** — Works with PostgreSQL & MongoDB
- 🧩 **Modular Codebase** — Clean separation of client, server, and shared logic

## 🛡️ Security Highlights

- AES-encrypted user & post data
- Scrypt password hashing with salt
- Secure key management & rotation
- Data integrity checks (MAC)
- Separate credential check logic

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server (default: PostgreSQL)
npm run dev
```

### 🗄️ Database Setup

#### PostgreSQL (Default)
- Start server: `npm run dev`
- Seed DB: `npm run db:seed`

#### MongoDB
- Start MongoDB: `./run-mongodb-server.sh`
- Seed DB: `./run-mongodb-seed.sh`

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
# PostgreSQL
DATABASE_URL=postgres://user:password@localhost:5432/secure_blog

# MongoDB
MONGODB_URI=mongodb://localhost:27017/secure_blog

# Session secret
SESSION_SECRET=your-secret-key
```

## 🗂️ Project Structure

```
client/      # React frontend (TypeScript)
server/      # Express backend (TypeScript)
db/          # Database config & seed scripts
shared/      # Shared schemas & types
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

---

<p align="center">
  <b>Made with ❤️ for security & simplicity</b>
</p>