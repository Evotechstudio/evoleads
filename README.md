# Evo Lead AI

AI-Powered Lead Generation SaaS platform with multi-tenant organization management.

## Features

- 🔐 OAuth authentication (Google, GitHub)
- 🏢 Multi-tenant organization management
- 🤖 AI-powered lead generation
- 💳 Integrated billing with Safepay
- 👥 Team collaboration and management
- 📱 Responsive design with dark/light mode
- ⚡ Built with Next.js 14 and TypeScript

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **Styling**: Tailwind CSS with custom design system
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Payment**: Safepay integration
- **Automation**: n8n webhook integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Safepay account (for payments)
- n8n instance (for lead generation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd evo-lead-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:
- Supabase URL and anon key
- n8n webhook URL and secret
- Safepay API credentials

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:check` - Check linting without fixing
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── env.ts            # Environment variable validation
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── types/                # Global type declarations
├── public/               # Static assets
└── .kiro/specs/         # Feature specifications and tasks
```

## Environment Variables

See `.env.example` for all required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `N8N_WEBHOOK_URL` - n8n webhook endpoint for lead generation
- `N8N_WEBHOOK_SECRET` - Secret for n8n webhook authentication
- `SAFEPAY_API_KEY` - Safepay API key for payments
- `SAFEPAY_WEBHOOK_SECRET` - Safepay webhook secret
- `NEXT_PUBLIC_APP_URL` - Your application URL

## Development

This project follows a spec-driven development approach. Check the `.kiro/specs/multi-tenant-lead-generation/` directory for:

- `requirements.md` - Feature requirements
- `design.md` - Technical design document
- `tasks.md` - Implementation task list

## Contributing

1. Follow the existing code style and conventions
2. Run `npm run lint` and `npm run type-check` before committing
3. Ensure all tests pass
4. Update documentation as needed

## License

This project is proprietary and confidential.
