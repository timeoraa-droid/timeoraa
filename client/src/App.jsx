import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import VoiceCallButton from './components/VoiceCallButton';
import Chatbot from './components/Chatbot';
import SearchOverlay from './components/SearchOverlay';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SplashScreen from './pages/SplashScreen';
import AccountTypeSelection from './pages/AccountTypeSelection';
import Home from './pages/Home';
import AllWatches from './pages/AllWatches';
import MensWatches from './pages/MensWatches';
import WomensWatches from './pages/WomensWatches';
import NewArrivals from './pages/NewArrivals';
import BestSellers from './pages/BestSellers';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Account from './pages/Account';
import Orders from './pages/Orders';
import About from './pages/About';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const FullPageLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0b0d] text-white">
      {!isAdminRoute && (
        <>
          <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
          <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <CartDrawer />
        </>
      )}
      <main className="flex-grow"><Outlet /></main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0b0d] text-white">
      <Navbar onOpenSearch={() => {}} />
      <main className="flex-grow"><Outlet /></main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <VoiceCallButton />
              <Chatbot />
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/splash" element={<SplashScreen />} />
                <Route path="/choose" element={<AccountTypeSelection />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user-login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route element={<FullPageLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/watches" element={<AllWatches />} />
                  <Route path="/men" element={<MensWatches />} />
                  <Route path="/women" element={<WomensWatches />} />
                  <Route path="/new-arrivals" element={<NewArrivals />} />
                  <Route path="/best-sellers" element={<BestSellers />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                </Route>
              </Routes>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
