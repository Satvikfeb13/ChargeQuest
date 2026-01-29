# ChargeQuest - EV Charging Station Finder

A modern React application for finding nearby electric vehicle charging stations with real-time location tracking and navigation features.

## Features

- 🔐 **User Authentication** - Secure login and registration
- 📍 **Geolocation** - Automatically detect user location
- 🗺️ **Interactive Maps** - View stations on Google Maps with markers
- 🧭 **Navigation** - One-click navigation to charging stations
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Real-time Updates** - Refresh station availability
- 🎨 **Modern UI** - Built with Tailwind CSS

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v3
- **API Client:** Axios
- **Maps:** Google Maps React (@react-google-maps/api)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Maps API Key (for interactive maps)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chargequest-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy the example env file
copy .env.example .env

# Edit .env and add your Google Maps API key
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Copy the API key to your `.env` file

**Note:** The app works without an API key using a basic embedded map, but for full interactive features (markers, info windows), an API key is required.

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
chargequest-frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API service files
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── store/          # Redux store and slices
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables example
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies and scripts
```

## Features Overview

### Authentication
- Login with email and password
- User registration with validation
- Protected routes for authenticated users
- Secure JWT token storage

### Station Discovery
- Automatic location detection
- Filter stations within 5km radius
- Display distance to each station
- Show availability status

### Map Integration
- **Interactive Mode** (with API key):
  - View all stations on Google Maps
  - Custom markers for user location and stations
  - Click markers for station details
  - One-click navigation
  
- **Basic Mode** (without API key):
  - Embedded Google Maps iframe
  - List of stations with navigate buttons
  - Direct links to Google Maps navigation

### Navigation
- One-click route to any station
- Opens in Google Maps (web or app)
- Automatic origin from user location

## API Configuration

The app expects a backend API running at `http://localhost:8080/api/v1` with the following endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /stations` - Get all charging stations

Update the base URL in `src/api/axios.jsx` if your API is hosted elsewhere.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@chargequest.com or open an issue in the repository.
