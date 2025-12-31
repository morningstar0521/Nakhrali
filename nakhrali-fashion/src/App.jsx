import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SimpleFooter from './components/SimpleFooter';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import HamperOptions from './pages/HamperOptions';
import CustomHamperBuilder from './pages/CustomHamperBuilder';

import SuggestedHampers from './pages/SuggestedHampers';
import HamperDetail from './pages/HamperDetail';

// Footer wrapper to conditionally render based on route
const FooterWrapper = () => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  return isHomepage ? <Footer /> : <SimpleFooter />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/products" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/hamper-options" element={<HamperOptions />} />
            <Route path="/hamper-options/:occasionId" element={<HamperOptions />} />
            <Route path="/suggested-hampers/:occasionId" element={<SuggestedHampers />} />
            <Route path="/hamper/:id" element={<HamperDetail />} />
            <Route path="/custom-hamper" element={<CustomHamperBuilder />} />
          </Routes>
        </main>
        <FooterWrapper />
      </div>
    </Router>
  );
}

export default App;
