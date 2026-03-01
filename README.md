# KINGBET Exchange - Points-Based Betting Platform

A modern, feature-rich betting exchange and casino platform built with React, TypeScript, and Vite. This application uses a points-based system (no real money) for educational and entertainment purposes.

## Features

### Exchange Platform
- Real-time odds for 1000+ markets across Cricket, Football, and Tennis
- Back and Lay betting system
- Cricket-specific fancy odds and session betting
- Live market updates
- Bet slip with instant stake calculation
- Comprehensive bet history

### Casino Games
- **Aviator**: Multiplier crash game with real-time gameplay
- **Plinko**: Ball drop game with multiplier slots
- **Crash**: Exponential curve betting game
- **Dice**: Roll-under probability game
- **Mines**: Grid-based gem discovery game

### User Management
- Role-based access control (User, Admin, Super Admin)
- Hierarchical user structure
- Points management system
- Transaction history
- Secure authentication with mock backend

### Admin Features
- User creation and management
- Points top-up/deduction
- Downline user tracking
- Comprehensive admin dashboard
- Super Admin hierarchy view

## Tech Stack

- **Frontend**: React 18.2 + TypeScript
- **Build Tool**: Vite 5.x
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites
- Node.js 16+ and npm (or use [nvm](https://github.com/nvm-sh/nvm))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd kingbet-instant-exchange

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
# Type check
npm run type-check

# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   ├── Layout.tsx
│   ├── Header.tsx
│   └── ErrorBoundary.tsx
├── context/          # React Context providers
│   ├── AuthContext.tsx
│   └── AppContext.tsx
├── pages/            # Route pages
│   ├── LoginPage.tsx
│   ├── ExchangePage.tsx
│   ├── CasinoPage.tsx
│   └── ...
├── hooks/            # Custom React hooks
├── services/         # API and business logic
├── types/            # TypeScript type definitions
├── data/             # Mock data
├── utils/            # Utility functions
├── constants/        # Application constants
└── config/           # Configuration files
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

## Default Users (Mock Data)

### Super Admin
- **Username**: superadmin
- **Password**: super123
- **Balance**: 1,000,000 points

### Admin
- **Username**: admin1 or admin2
- **Password**: admin123

### Regular Users
- **Username**: player1, player2, player3, player4
- **Password**: user123

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_APP_NAME=KINGBET Exchange
VITE_APP_VERSION=1.0.0
VITE_ENABLE_CASINO=true
VITE_ENABLE_EXCHANGE=true
```

## Security Features

- Error boundary for graceful error handling
- Input validation and sanitization
- XSS protection
- Role-based access control
- Secure authentication flow
- LocalStorage encryption considerations

## Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Comprehensive error handling
- React best practices
- Modular architecture

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React lazy loading
- Optimized build with Vite
- Memoized components and callbacks
- Efficient state management
- Minimal re-renders

## Future Enhancements

- Backend API integration
- Supabase database integration
- Real-time WebSocket updates
- Advanced analytics dashboard
- Mobile app (React Native)
- Payment gateway integration (educational)

## License

This project is for educational purposes only. No real money gambling is supported.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions, please open a GitHub issue.

---

**Note**: This is a points-based platform for educational purposes. No real money transactions are supported.
