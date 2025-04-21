# NHL Predictor App

A modern, data-driven NHL game prediction application that uses team statistics to forecast game outcomes with visual presentation of prediction confidence and factors.

## Live Demo

[View the NHL Predictor App](https://nhl-predictor.up.railway.app/)

## Features

- Real-time NHL game predictions based on team statistics
- Browse upcoming NHL games by date
- Track prediction accuracy over time
- Responsive design for mobile and desktop
- View detailed team advantages and win probabilities

## Tech Stack

### Frontend
- **Framework**: React Native + Expo
- **Navigation**: Expo Router with React Navigation
- **State Management**: Redux (@reduxjs/toolkit)
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Custom-built with React Native
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Icons**: Lucide React Native & Expo Vector Icons
- **Data Visualization**: Victory Native
- **Real-time Updates**: Socket.io Client

### Backend
- **Runtime**: Node.js (v18+)
- **Database**: PostgreSQL (via Prisma ORM)
- **API**: Express.js REST API
- **HTTP Client**: Axios
- **Data Sources**: NHL Stats API, ESPN API
- **Authentication**: Supabase

### Development Tools
- TypeScript
- Prisma Client
- Expo CLI
- React Native Dev Tools
- Jest & Testing Library
- ts-node-dev
- TailwindCSS

## How It Works

The NHL Predictor uses a custom algorithm to predict game outcomes based on:

1. Team's offensive and defensive performance metrics
2. Special teams effectiveness (power play, penalty kill)
3. Home ice advantage factors
4. Team momentum and efficiency metrics
5. Historical head-to-head performance

Predictions are visualized with intuitive UI elements showing win probability, score predictions, and key factors influencing the outcome.

## Project Structure

```
nhl-predictor/
├── app/                  # Expo Router app entry
├── components/           # Reusable UI components
├── constants/            # App constants and configuration
├── hooks/                # Custom React hooks
├── services/             # API and data services
├── store/                # Redux store configuration
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── nhl-predictor-backend/# Backend server
    ├── prisma/           # Database schema and migrations
    └── src/              # Server source code
        ├── services/     # Backend services
        └── ...           # Other server modules
```

## Key Dependencies

### Frontend
- expo (v52)
- react (v18.3)
- react-native (v0.76)
- expo-router (v4)
- @react-navigation/native (v7)
- @react-navigation/native-stack (v7)
- @reduxjs/toolkit (v2.5)
- @tanstack/react-query (v5)
- react-redux (v9)
- @expo/vector-icons (v14)
- lucide-react-native (v0.468)
- react-native-reanimated (v3)
- react-native-safe-area-context (v4.12)
- nativewind (v4)
- victory-native (v41)
- socket.io-client (v4)
- @supabase/supabase-js (v2)

### Backend
- express (v4)
- prisma (v5)
- @prisma/client (v5)
- axios (v1)
- cors (v2)
- dotenv (v16)
- typescript (v5)
- ts-node-dev (v2)

## Installation

### Prerequisites
- Node.js (v18.18.0 or higher)
- npm or yarn
- PostgreSQL database
- Expo Go app (for mobile testing)

### Setup Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/nhl-predictor.git
cd nhl-predictor
```

Note: Replace `yourusername` with your actual GitHub username.

2. Install dependencies
```bash
npm install
```

3. Set up the backend
```bash
cd nhl-predictor-backend
npm install
```

4. Configure environment variables
   - Create a `.env` file in the backend directory
   - Add the following configuration (customize as needed):
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/nhl_predictor?schema=public"
   PORT=3000
   SUPABASE_URL="your-supabase-url"
   SUPABASE_KEY="your-supabase-key"
   ```

5. Initialize the database
```bash
npx prisma db push
```

6. Start the development servers
```bash
# In the backend directory
npm run dev

# In the main directory
npm start
```

For web deployment:
```bash
# Build the web version
npx expo export:web

# Serve the web build
npx serve web-build
```

7. Use Expo Go app on your mobile device or an emulator to run the app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/nhl-predictor](https://github.com/yourusername/nhl-predictor)
