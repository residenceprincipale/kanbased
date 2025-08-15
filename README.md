# KanBased

A minimal Kanban board application with instant real-time sync, keyboard shortcuts, and rich markdown editing. Perfect for teams seeking fast, clutter-free project management.

## Features

- **Real-time Sync** - Changes sync instantly across all devices using a sync engine called [Zero](https://zero.rocicorp.dev/)
- **Keyboard Shortcuts** - Navigate and manage all the tasks and notes with keyboard shortcuts. Also has a CMD+K search to easily find all your tasks
- **Rich Markdown** - Create detailed task descriptions and take your notes with rich markdown support backed by ProseMirror library
- **Team Collaboration** - Invite team members and work together seamlessly
- **Minimal Interface** - Clean, distraction-free design focused on productivity
- **Self-hostable** - Free and open-source

## Tech Stack

- **Frontend**: React SPA, TanStack Router
- **Backend**: Hono, Node.js, Drizzle ORM, PostgreSQL
- **Authentication**: [Better Auth](https://better-auth.com)
- **Real-time Sync**: [Zero sync engine](https://zero.rocicorp.dev/docs/introduction)
- **Storage**: S3-compatible file storage
- **Email**: [Resend](https://resend.com)

## Project Structure

```
├── frontend/         # React SPA
├── backend/          # API server and database
└── landing-page/     # Static site
```

## Getting Started

Each app has its own setup instructions:

- **Frontend**: See [`frontend/README.md`](./frontend/README.md) for client application setup
- **Backend**: See [`backend/README.md`](./backend/README.md) for API server, sync engine and database setup

## Bug report / Feature request

Please create a GitHub issue for reporting a bug or requesting a feature.

## License

KanBased is released under the MIT License.
