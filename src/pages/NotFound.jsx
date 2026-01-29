import { useNavigate } from 'react-router-dom';
import { BatteryWarning, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full"></div>
                    <div className="relative">
                        <BatteryWarning size={120} className="mx-auto text-primary-500 stroke-[1.5]" />
                        <motion.div 
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/5 tracking-tighter select-none pointer-events-none"
                        >
                            404
                        </motion.div>
                    </div>
                </motion.div>

                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Energy Depleted
                </h1>
                <p className="text-slate-400 mb-10 leading-relaxed">
                    The station you're looking for seems to have gone off the grid or never existed. Let's get you back to safety.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/')} 
                        className="flex items-center justify-center gap-2 group px-8"
                    >
                        <Home size={18} />
                        Back to Home
                    </Button>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
