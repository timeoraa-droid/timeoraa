import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Watch, User, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AccountTypeSelection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  // If already authenticated, redirect to appropriate panel
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 text-gray-100 flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6">
        
        <div className="bg-[#121217] border border-[#242432] rounded-2xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-[#2dd4bf]/40 mx-auto flex items-center justify-center text-[#2dd4bf] mb-3 bg-[#181822]">
              <Watch size={24} />
            </div>
            <h1 className="font-['Cinzel'] font-bold text-2xl text-white tracking-wider">
              Choose Account Type
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Select how you would like to access TIMEORA
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="space-y-4">
            
            {/* User Card */}
            <button
              onClick={() => navigate('/user-login')}
              className="w-full group p-6 rounded-xl bg-[#171722] border border-[#2c2c3c] hover:border-[#2dd4bf]/60 text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#2dd4bf]/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a26] border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf] group-hover:bg-[#2dd4bf]/10 transition-colors">
                    <User size={22} />
                  </div>
                  <div>
                    <h2 className="font-['Cinzel'] font-bold text-lg text-white group-hover:text-[#2dd4bf] transition-colors">
                      User
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Browse, purchase & manage your collection
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-500 group-hover:text-[#2dd4bf] transition-colors" />
              </div>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full group p-6 rounded-xl bg-[#171722] border border-[#2c2c3c] hover:border-[#818cf8]/60 text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#818cf8]/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a26] border border-[#818cf8]/30 flex items-center justify-center text-[#818cf8] group-hover:bg-[#818cf8]/10 transition-colors">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h2 className="font-['Cinzel'] font-bold text-lg text-white group-hover:text-[#818cf8] transition-colors">
                      Admin
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Manage products, orders & store settings
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-500 group-hover:text-[#818cf8] transition-colors" />
              </div>
            </button>

          </div>

          {/* Footer text */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>Admin accounts are created by the store administrator.</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AccountTypeSelection;
