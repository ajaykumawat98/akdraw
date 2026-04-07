# akdraw

> Infinite Canvas for Network Engineers

akdraw is a powerful web-based canvas application designed specifically for network engineers and infrastructure documentation. It combines the best features of Excalidraw, Microsoft OneNote, Notepad++, CherryTree, and MS Paint into a unified workspace.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)

## ✨ Features

### 🎨 Canvas Engine
- **Infinite Pan & Zoom** - Navigate smoothly from 10% to 5000% zoom
- **Multi-Layer System** - Organize content with base, object, ink, and overlay layers
- **Grid Options** - Dot grid, line grid, dark mode, blueprint, or custom backgrounds
- **60fps Rendering** - Optimized for smooth performance with 1000+ objects

### 📝 Smart Text Objects
- **Multiple Text Styles** - Plain text, CLI boxes, headings (H1-H3), callouts
- **Canvas-Local Auto-complete** - Suggestions from words already on your canvas
- **CLI Auto-Detection** - Automatically format CLI commands with syntax highlighting
- **Per-Character Formatting** - Bold, italic, underline, colors at character level

### 🔷 Shapes & Diagrams
- **Hand-Drawn Style** - Excalidraw-style rough appearance using Rough.js
- **Smart Arrows** - Elbow, curved, and straight connectors with auto-routing
- **Network Shapes** - Routers, switches, firewalls, servers, clouds
- **Tables** - Full-featured tables with formatting and cell merging

### 👥 Real-time Collaboration
- **WebSocket-based Sync** - See changes instantly
- **Live Cursors** - Track where collaborators are working
- **Object Locking** - Prevent conflicts while editing
- **Built-in Chat** - Communicate while working

### 💾 Storage & Export
- **Cloud Persistence** - PostgreSQL backend with versioning
- **Excalidraw Import/Export** - Full compatibility with .excalidraw files
- **PNG/PDF Export** - Export diagrams for documentation
- **Auto-Save** - Never lose your work

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Docker (optional)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/akdraw.git
cd akdraw

# Setup backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev

# In a new terminal, setup frontend
cd ../frontend
npm install
npm run dev
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# Access the app
open http://localhost:5173
```

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL + Drizzle ORM
- Socket.io for real-time collaboration
- JWT authentication
- Puppeteer for export

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- Zustand for state management
- Rough.js for hand-drawn graphics
- TanStack Query for data fetching

### Database Schema

```
users
├── canvases (1:N)
├── canvas_collaborators (1:N)
└── canvas_objects (created_by, updated_by)

canvases
├── canvas_objects (1:N)
├── canvas_versions (1:N)
├── tags (1:N)
└── tree_nodes (1:N)
```

## 📁 Project Structure

```
akdraw/
├── backend/
│   ├── src/
│   │   ├── db/           # Database schema and migrations
│   │   ├── routes/       # API routes
│   │   ├── services/     # WebSocket and business logic
│   │   ├── middleware/   # Auth, error handling
│   │   └── utils/        # Helpers
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── canvas/   # Canvas-specific components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # Zustand stores
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🛣️ Roadmap

### Phase 1 ✅
- [x] Infinite canvas with pan/zoom
- [x] Text objects with style switching
- [x] Canvas-local auto-completion
- [x] Basic shapes and arrows
- [x] Real-time collaboration

### Phase 2 🚧
- [ ] Handwriting recognition
- [ ] OCR for network diagrams
- [ ] Git integration
- [ ] Plugin system
- [ ] Mobile app

### Phase 3 📋
- [ ] AI-powered layout
- [ ] Text-to-diagram generation
- [ ] Video recording
- [ ] Confluence/Jira integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Excalidraw](https://excalidraw.com/) - For the hand-drawn aesthetic inspiration
- [Rough.js](https://roughjs.com/) - For the sketchy graphics
- [Perfect Freehand](https://github.com/steveruizok/perfect-freehand) - For ink rendering

## 📧 Contact

For questions or support, please open an issue or contact us at [your-email@example.com](mailto:your-email@example.com).

---

Made with ❤️ for network engineers
