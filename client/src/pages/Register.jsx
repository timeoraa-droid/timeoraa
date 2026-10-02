import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Watch, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(name, email, password, confirmPassword);
      if (res.success) {
        navigate('/account', { replace: true });
      } else {
        setError(res.message || 'Unable to register account.');
      }
    } catch {
      setError('Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 text-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        
        <div className="bg-[#121217] border border-[#242432] rounded-2xl p-8 sm:p-10 shadow-2xl relative">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-[#2dd4bf]/40 mx-auto flex items-center justify-center text-[#2dd4bf] mb-3 bg-[#181822]">
              <Watch size={24} />
            </div>
            <h1 className="font-['Cinzel'] font-bold text-2xl text-white tracking-wider">
              Create User Account
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Join the distinguished circle of TIMEORA collectors
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lord Alexander Wright"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-400 flex items-start space-x-2">
              <ShieldCheck size={16} className="text-[#2dd4bf] flex-shrink-0 mt-0.5" />
              <span>By creating an account, you receive lifetime authentication of timepieces and access to the private collector circle.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#2dd4bf]/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-gray-400 space-y-2">
            <div>
              Already registered?{' '}
              <Link to="/user-login" className="text-[#2dd4bf] font-semibold hover:underline">
                Sign In Here
              </Link>
            </div>
            <div>
              <Link to="/choose" className="text-[#2dd4bf] font-semibold hover:underline inline-flex items-center space-x-1">
                <ArrowLeft size={12} />
                <span>Choose a Different Account Type</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
