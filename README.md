# BoardMate AI

## Project Description
BoardMate AI is an application designed to help users find the perfect board game for any occasion by analyzing player preferences and suggesting the best games based on the number of participants, difficulty level, and gameplay style. It addresses the common issues of overwhelming choices, mismatched games, and lack of personalized recommendations.

## Tech Stack
- **Frontend:**
  - [Astro 5](https://astro.build) for fast, efficient pages with minimal JavaScript.
  - [React 19](https://reactjs.org) for interactivity.
  - [TypeScript 5](https://www.typescriptlang.org) for static typing and better IDE support.
  - [Tailwind 4](https://tailwindcss.com) for styling.
  - [Shadcn/ui](https://ui.shadcn.com) for available React components.
  
- **Backend:**
  - [Supabase](https://supabase.io) for PostgreSQL database and user authentication.

- **AI:**
  - [Openrouter.ai](https://openrouter.ai) for communication with various AI models.

- **CI/CD and Hosting:**
  - [GitHub Actions](https://github.com/features/actions) for CI/CD pipelines.
  - [DigitalOcean](https://www.digitalocean.com) for hosting via Docker images.

## Getting Started Locally
To set up the project locally, follow these steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/boardmate-ai.git
   cd boardmate-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.

## Project Scope
The project will include:
- A user account system for saving favorite games and preferences.
- A user profile page for specifying player count, preferred playtime, and game types.
- AI-generated game recommendations based on user preferences.

**Exclusions:**
- No integration with game review databases.
- No direct ordering of games from the application.
- No advanced game mechanics analysis for individual users.

## Project Status
The project is currently in development.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
