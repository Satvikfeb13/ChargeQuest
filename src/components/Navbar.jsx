import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Zap, User, LogOut, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const role = user?.role || user?.authorities?.[0]?.authority || user?.roles?.[0];
  const isAdmin = role?.toString().toUpperCase().includes('ADMIN');

  const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'Stations', 
      path: isAdmin ? '/admin/stations' : '/stations' 
    },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-tr from-primary-500 to-secondary-500 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300">
              <Zap className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all">
              ChargeQuest
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-300 hover:text-white font-medium transition-colors text-sm tracking-wide"
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="flex items-center space-x-2 text-slate-300 hover:text-primary-400 transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                  <div className="h-6 w-px bg-slate-700/50"></div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400">{user?.email}</span>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-400 bg-slate-900/50 hover:bg-slate-800 rounded-full transition-all"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary text-sm shadow-lg shadow-primary-500/20">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-slate-800 my-4 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                     <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-3 py-3 text-slate-300 hover:bg-slate-800 rounded-md"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <div className="px-3 text-sm text-slate-500">{user?.email}</div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-3 text-red-400 hover:bg-slate-800 rounded-md flex items-center space-x-2"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 px-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center py-3 text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center py-3 btn-primary"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
