# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production version
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests with Vitest
- `pnpm postinstall` - Generate Prisma client (runs automatically after install)

### Database Commands
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate deploy` - Deploy migrations in production
- `npx prisma studio` - Open Prisma Studio for database GUI

### Testing
- `pnpm test` - Run all tests with Vitest
- Tests are located in `src/features/card/logic/__tests__/`
- Testing framework uses Vitest with jsdom environment

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Anthropic Claude API
- **Analytics**: PostHog
- **Testing**: Vitest with Testing Library
- **Styling**: Tailwind CSS

### Core Features
This is a language learning platform called "Write Right" that uses:
1. **Spaced Repetition System**: Cards with algorithmic scheduling based on user performance
2. **AI-Generated Content**: Anthropic Claude generates contextual sentences and learning materials
3. **Multi-language Support**: Supports Danish, English, Spanish, Portuguese, and Italian
4. **Progressive Learning**: Onboarding flow with native/target language selection

### Key Architecture Patterns

#### Database Schema
- **User**: Core user model with language preferences and onboarding status
- **Card**: Spaced repetition cards with easeFactor, interval, and nextDueDate
- **Sentence**: AI-generated learning content with translations
- **Word**: Individual word definitions within sentences
- **CardReviewLog**: Review history for spaced repetition algorithm

#### Spaced Repetition Algorithm
Located in `src/features/card/logic/`:
- `processCardReview.ts` - Main entry point for card review processing
- `calculateEaseFactor.ts` - Adjusts difficulty based on user performance
- `calculateNextInterval.ts` - Determines next review timing
- `calculateNextDueDate.ts` - Calculates when card should appear next

#### Feature Organization
Features are organized in `src/features/` with:
- `logic/` - Core business logic and algorithms
- `services/` - API interaction and data fetching
- `components/` - Feature-specific UI components
- `types.ts` - Feature-specific TypeScript types

### API Routes Structure
- `POST /api/sentence` - Generate new practice sentences via AI
- `GET /api/card/types/sentence/[userId]` - Fetch user's practice cards
- `POST /api/card/[cardId]/review` - Submit card review with rating (0, 3, or 5)
- `PUT /api/user/[userId]/language-preference` - Update target learning language
- `PUT /api/user/[userId]/native-language` - Update native language

### Authentication Flow
- Uses NextAuth.js with Google OAuth
- Custom callbacks handle user creation/lookup via profile feature
- Session includes user ID for database operations
- Redirect to `/login` for unauthenticated users

### Environment Variables
Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - For AI content generation
- `AUTH_SECRET` - NextAuth.js secret
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` - Google OAuth credentials
- `NEXT_PUBLIC_POSTHOG_KEY` - Analytics (optional)

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/features/` - Feature-specific code organized by domain
- `src/components/` - Reusable UI components
- `src/lib/` - Utility libraries and API helpers
- `src/prompts/` - AI prompt templates for content generation
- `prisma/` - Database schema and migrations