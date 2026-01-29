import { Link } from 'react-router-dom';
import { Zap, MapPin, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                Power Up
              </span>{' '}
              Your Journey <br />
              Anywhere, Anytime.
            </h1>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Find, book, and pay for EV charging stations seamlessly. Join the network of the future.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/stations" className="btn-primary text-lg px-8 py-3">
                Find Stations
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
