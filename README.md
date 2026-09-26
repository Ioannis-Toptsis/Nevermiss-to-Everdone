# Nevermiss to Everdone

An unofficial companion for **Neverness to Everness** — a modern web dashboard for managing daily tasks (Dailys), weekly tasks (Weeklys), and checklists for the NTE server.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwind-css)

## Features

- **📅 NTE Dailys & Weeklys Tracker** — Manage all daily and weekly tasks in one place
- **⏰ Reset Timers** — Automatic server reset calculations with customizable presets
- **🎮 Guest Mode** — Start instantly without registration
- **🔗 Quick Links** — Fast access to maps, guides, codes, and community resources
- **☁️ Synced Progress** — Optional account-based progress synchronization across devices
- **🎨 Responsive Design** — Works perfectly on desktop, tablet, and mobile
- **🔒 Secure Authentication** — Bcrypt-encrypted passwords and session management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **UI Components**: Lucide React Icons
- **State Management**: React Hooks, Zod Schema Validation
- **Drag & Drop**: dnd-kit (sortable lists)
- **Security**: bcryptjs, HTTP-only Cookies
- **Date Handling**: date-fns, date-fns-tz

## Quick Start

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ioannis-Toptsis/Nevermiss-to-Everdone.git
   cd "Nevermiss to Everdone"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:4000 in your browser

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Usage

### Guest Mode
- Open the app and start managing your tasks immediately
- No registration required
- Data is stored locally in your browser

### Create an Account
- Create an account to sync your data across devices
- Access your progress from anywhere
- All data is encrypted and secure

### Server Reset Timers
- Select your preferred server reset preset
- Daily resets are calculated automatically
- Weekly resets typically start on Monday

## Project Structure

```
src/
├── app/              # Next.js App Router & Pages
│   ├── api/          # API Routes
│   ├── legal/        # Legal pages
│   ├── layout.tsx    # Root Layout
│   └── page.tsx      # Homepage
├── components/       # React Components
│   ├── dashboard.tsx           # Main dashboard
│   ├── background-video.tsx    # Video background
│   ├── legal-page-frame.tsx    # Legal pages wrapper
│   └── seo-sections.tsx        # SEO content sections
├── lib/              # Utilities & Helpers
│   ├── seo.ts        # SEO configuration
│   ├── i18n.ts       # Internationalization
│   ├── utils.ts      # Helper functions
│   ├── types.ts      # TypeScript types
│   └── server/       # Server-side utilities
└── types/            # Shared TypeScript types
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database connection (if using backend)
DATABASE_URL=your_database_url

# Session secret key
SESSION_SECRET=your_secret_key

# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Configuration

### TypeScript
The project uses strict TypeScript settings:
- `strict: true` — Strict type checking enabled
- Path alias: `@/*` → `./src/*`
- Full DOM and ES2017 support

### Styling
- Utility-first approach with Tailwind CSS
- Mobile-first responsive design
- PostCSS for processing
- Custom component conventions

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance & Security

### Performance
- Next.js Image Optimization
- Automatic code splitting and lazy loading
- Incremental Static Regeneration (ISR)
- Gzip compression

### Security
- CSRF token protection on forms
- HTTP-only cookies for sessions
- Bcrypt password hashing
- Content Security Policy (CSP)
- Zod schema validation for all inputs
- XSS protection

## API Endpoints

### Authentication
- `POST /api/auth/login` — User login
- `POST /api/auth/register` — User registration  
- `POST /api/auth/logout` — Log out
- `POST /api/auth/session` — Get current session

### Tasks
- `GET /api/tasks` — Fetch user tasks
- `POST /api/tasks` — Create new task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

### Progress
- `GET /api/progress` — Get progress data
- `POST /api/progress` — Save progress

## FAQ

**Q: Is there a cost?**  
A: No, the application is completely free to use.

**Q: Where is my data stored?**  
A: In guest mode, data is stored locally in your browser. With an account, data is stored on our secure servers with encryption.

**Q: Can I delete my data?**  
A: Yes, you can delete your account and all associated data from your account settings at any time.

**Q: Is this an official project?**  
A: No, this is an unofficial community project.

## Troubleshooting

### Port 4000 already in use
```bash
# On Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -i :4000
kill -9 <PID>
```

### Dependencies issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Support & Contact

- **Email**: support@janni.email
- **Discord**: [Join our community](https://janni.fun/discord)

## Related Resources

- [Website](https://janni.fun)
- [Community Discord](https://janni.fun/discord)
- [Issues & Bug Reports](../../issues)
- [Feature Requests](../../discussions)

## Acknowledgments

- Neverness to Everness Community
- Next.js and React teams
- All our users and testers

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for full details.

---

**Status**: This plugin is no longer under active development and will not receive future updates or support.
