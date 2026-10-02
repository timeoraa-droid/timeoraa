import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await adminLogin(loginId, password);
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          setError('This account does not have administrator privileges.');
        }
      } else {
        setError(res.message || 'Unable to sign in. Please verify your credentials.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 text-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        
        <div className="bg-[#121217] border border-[#242432] rounded-2xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-[#818cf8]/40 mx-auto flex items-center justify-center text-[#818cf8] mb-3 bg-[#181822]">
              <Shield size={24} />
            </div>
            <h1 className="font-['Cinzel'] font-bold text-2xl text-white tracking-wider">
              Admin Sign In
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Access the TIMEORA administration panel
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
                Admin ID or Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Admin ID or email"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#818cf8]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="uppercase tracking-wider text-gray-400 font-medium">
                  Password
                </label>
                <span className="text-gray-500 hover:text-[#818cf8] cursor-pointer text-[11px]">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#818cf8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3.5 bg-[#818cf8] hover:bg-[#a5b4fc] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#818cf8]/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In as Admin'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Back to account type selection */}
          <div className="text-center mt-6 text-xs text-gray-400">
            <Link to="/choose" className="text-[#818cf8] font-semibold hover:underline inline-flex items-center space-x-1">
              <ArrowLeft size={12} />
              <span>Choose a Different Account Type</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
