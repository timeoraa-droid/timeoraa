import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [savedAddresses, setSavedAddresses] = useState(user?.addresses || []);

  const handleAddAddress = () => {
    const newAddr = {
      _id: Date.now().toString(),
      label: 'New Address',
      isDefault: savedAddresses.length === 0,
      firstName: user?.name?.split(' ')[0] || '',
      lastName: '', phone: '', address: '', city: '', state: '', postalCode: '', country: '',
    };
    setSavedAddresses(prev => [...prev, newAddr]);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#121218] border border-[#242432] rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl text-white">My Account</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
            <button onClick={logout} className="px-5 py-2.5 bg-[#181822] hover:bg-red-950/40 border border-[#2d2d3d] text-gray-300 hover:text-red-400 text-xs uppercase rounded-lg">Sign Out</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#121218] border border-[#22222d] rounded-2xl overflow-hidden">
            {['profile', 'addresses', 'orders'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-6 py-4 text-xs uppercase tracking-wider ${activeTab === tab ? 'bg-[#2dd4bf]/10 text-[#2dd4bf] border-l-2 border-[#2dd4bf]' : 'text-gray-400 hover:bg-[#161620]'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <div className="bg-[#121218] border border-[#22222d] rounded-2xl p-6 sm:p-8">
                <h2 className="font-bold text-lg text-white mb-4">Profile</h2>
                <div className="space-y-4 text-xs">
                  <div><span className="text-gray-400">Name</span><p className="text-white font-semibold">{user?.name}</p></div>
                  <div><span className="text-gray-400">Email</span><p className="text-white">{user?.email}</p></div>
                  <div><span className="text-gray-400">Role</span><p className="text-white capitalize">{user?.role}</p></div>
                  <div><span className="text-gray-400">Membership</span><p className="text-[#2dd4bf]">{user?.membershipTier || 'TIMEORA Royal Patron'}</p></div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-[#121218] border border-[#22222d] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-white">Addresses</h2>
                  <button onClick={handleAddAddress} className="px-4 py-2 bg-[#2dd4bf] text-black text-xs font-semibold rounded-lg">Add Address</button>
                </div>
                {savedAddresses.length === 0 ? (
                  <p className="text-gray-400 text-sm">No saved addresses</p>
                ) : (
                  savedAddresses.map(addr => (
                    <div key={addr._id} className="bg-[#161620] border border-[#22222d] rounded-xl p-4 mb-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{addr.label}</p>
                          <p className="text-gray-400">{addr.address}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        </div>
                        {addr.isDefault && <span className="bg-[#2dd4bf]/15 text-[#2dd4bf] px-2 py-0.5 rounded text-[10px]">Default</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-[#121218] border border-[#22222d] rounded-2xl p-6 text-center text-gray-400">
                <p>Your orders will appear here. <a href="/orders" className="text-[#2dd4bf]">View all orders</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
