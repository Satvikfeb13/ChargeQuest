import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (error) {
           // Handled by context toast
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              className="input-field" 
              placeholder="Full Name"
              autoComplete="name"
            />
            {errors.name && <span className="text-red-400 text-sm">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
            <input 
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="input-field" 
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <span className="text-red-400 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
            <input 
              {...register('phone', { required: 'Phone is required' })}
              className="input-field" 
              placeholder="Phone Number"
              autoComplete="tel"
            />
             {errors.phone && <span className="text-red-400 text-sm">{errors.phone.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <input 
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
              type="password"
              className="input-field" 
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.password && <span className="text-red-400 text-sm">{errors.password.message}</span>}
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full btn-primary py-3 mt-4"
          >
            {isSubmitting ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
