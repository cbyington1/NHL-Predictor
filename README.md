# NHL Predictor
A modern, data-driven NHL game prediction application that uses team statistics to forecast game outcomes with visual presentation of prediction confidence and factors.

## Live Demo
[View the NHL Predictor App](https://nhl-predictor.up.railway.app/)

## Features
- **Real-time NHL Game Predictions**: 
  - Data-driven forecasting based on team statistics
  - Win probability visualization
  - Detailed prediction factors breakdown
  - Prediction accuracy tracking
- **Game Browsing and Tracking**: 
  - Browse upcoming NHL games by date
  - Track completed games and prediction outcomes
  - View team records and performance metrics
  - Filter games by team or date range
- **Team Analysis**:
  - Detailed team statistics display
  - Performance metrics visualization
  - Head-to-head comparison tools
  - Historical performance data
- **User Experience**:
  - Responsive design for mobile and desktop
  - Interactive game cards with team logos
  - Dynamic visual elements with hover effects
  - Real-time updates via web sockets

## How It Works
The NHL Predictor uses a custom algorithm to predict game outcomes based on:

1. **Data Collection**:
   - Team offensive and defensive performance metrics
   - Special teams effectiveness (power play, penalty kill)
   - Home ice advantage factors
   - Team momentum and efficiency metrics

2. **Analysis Engine**:
   - Statistical comparison of team strengths
   - Home vs. away performance adjustments
   - Advanced metrics for shooting efficiency
   - Win probability calculation

3. **Results Presentation**:
   - Visual probability indicators
   - Detailed factor breakdown
   - Historical accuracy tracking
   - Predicted score display

## Technical Details
### Prerequisites
- Node.js (v18.18.0 or higher)
- npm or yarn
- PostgreSQL database
- Expo Go app (for mobile testing)

### Installation
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

### Project Structure
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

### Key Technologies

#### Frontend
- **Core Framework**:
  - React (v18.3.1)
  - React Native (v0.76.5)
  - React DOM (v18.3.1)
  - React Native Web (v0.19.13)

- **Expo Framework**:
  - Expo (v52.0.19)
  - Expo Font (v13.0.1)
  - Expo Linking (v7.0.3)
  - Expo Router (v4.0.13)
  - Expo Splash Screen (v0.29.18)
  - Expo Status Bar (v2.0.0)
  - Expo System UI (v4.0.6)
  - Expo Web Browser (v14.0.1)

- **Navigation**:
  - @react-navigation/native (v7.0.14)
  - @react-navigation/native-stack (v7.2.0)
  - React Native Safe Area Context (v4.12.0)
  - React Native Screens (v4.1.0)

- **State Management**:
  - Redux with @reduxjs/toolkit (v2.5.0)
  - React Redux (v9.2.0)

- **Data Fetching**:
  - @tanstack/react-query (v5.62.7)
  - Socket.io Client (v4.8.1)
  - @supabase/supabase-js (v2.47.5)

- **UI and Styling**:
  - @expo/vector-icons (v14.0.2)
  - Lucide React Native (v0.468.0)
  - NativeWind (v4.1.23)
  - TailwindCSS (v3.3.2)
  - React Native Reanimated (v3.16.1)

- **Data Visualization**:
  - Victory Native (v41.12.5)

- **Web Deployment**:
  - Serve (v14.2.4)

#### Backend
- **Server Framework**:
  - Express (v4.18.2)
  - @types/express (v4.17.21)

- **Database**:
  - Prisma (v5.22.0)
  - @prisma/client (v5.22.0)
  - MongoDB (via Mongoose)
  - Mongoose (v8.13.2)
  - @types/mongoose (v5.11.97)

- **HTTP Client**:
  - Axios (v1.6.7)

- **Utilities**:
  - CORS (v2.8.5)
  - @types/cors (v2.8.17)
  - Dotenv (v16.4.1)

#### Development Tools
- **TypeScript**:
  - TypeScript (v5.3.3)
  - @types/react (v18.3.12)
  - @types/react-native (v0.73.0)
  - @types/node (v20.11.16)

- **Build Tools**:
  - @babel/core (v7.25.2)
  - TS-Node (v10.9.2)
  - TS-Node-Dev (v2.0.0)

- **Testing**:
  - Jest (v29.2.1)
  - Jest-Expo (v52.0.2)
  - React Test Renderer (v18.3.1)
