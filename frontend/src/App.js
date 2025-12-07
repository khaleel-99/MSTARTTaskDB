import React, { useState, useEffect } from 'react';
import './App.css';
import headerStyles from './components/Header.module.css';
import Login from './components/Login';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Orders from './components/Orders';
import ProductManagement from './components/ProductManagement';
import UserManagement from './components/UserManagement';
import Cart from './components/Cart';
import Profile from './components/Profile';
import { authService } from './services/authService';
import { getCart } from './services/cartService';
import { useTheme } from './context/ThemeContext';

function App() {
  const { theme, language, toggleTheme, toggleLanguage, t } = useTheme();
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('products');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setUser(authService.getCurrentUser());
    }
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(count);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('products');
  };

  const handleCheckoutSuccess = () => {
    updateCartCount();
    setCurrentView('orders');
  };

  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('productDetail');
  };

  const handleBackToProducts = () => {
    setCurrentView('products');
    setSelectedProductId(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header className={headerStyles.header}>
        <div className={headerStyles.headerContent}>
          <h1 className={headerStyles.logo}>
            <span>🚀</span>
            <span>MSTART</span>
          </h1>

          <div className={headerStyles.navSection}>
            <button
              onClick={toggleTheme}
              className={headerStyles.iconButton}
              title={theme === 'light' ? t('dark') : t('light')}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button
              onClick={toggleLanguage}
              className={headerStyles.iconButton}
            >
              {language === 'en' ? '🇸🇦' : '🇺🇸'}
            </button>

            <button
              onClick={() => setCurrentView('products')}
              className={`${headerStyles.navButton} ${currentView === 'products' ? headerStyles.active : ''}`}
            >
              📦 {t('products')}
            </button>

            <button
              onClick={() => setCurrentView('orders')}
              className={`${headerStyles.navButton} ${currentView === 'orders' ? headerStyles.active : ''}`}
            >
              📋 {t('orders')}
            </button>

            <button
              onClick={() => setCurrentView('profile')}
              className={`${headerStyles.navButton} ${currentView === 'profile' ? headerStyles.active : ''}`}
            >
              👤 {t('profile')}
            </button>

            {user.role === 'Admin' && (
              <>
                <button
                  onClick={() => setCurrentView('productManagement')}
                  className={`${headerStyles.navButton} ${currentView === 'productManagement' ? headerStyles.active : ''}`}
                >
                  ⚙️ {t('manageProducts')}
                </button>
                <button
                  onClick={() => setCurrentView('userManagement')}
                  className={`${headerStyles.navButton} ${currentView === 'userManagement' ? headerStyles.active : ''}`}
                >
                  👥 {t('manageUsers')}
                </button>
              </>
            )}

            <button
              onClick={() => setShowCart(true)}
              className={`${headerStyles.navButton} ${headerStyles.cartButton}`}
            >
              🛒 {t('cart')}
              {cartItemCount > 0 && (
                <span className={headerStyles.cartBadge}>{cartItemCount}</span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className={`${headerStyles.navButton} ${headerStyles.logoutButton}`}
            >
              🚪 {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <main>
        {currentView === 'products' && <Products onCartUpdate={updateCartCount} onViewProduct={handleViewProduct} />}
        {currentView === 'productDetail' && selectedProductId && (
          <ProductDetail
            productId={selectedProductId}
            onCartUpdate={updateCartCount}
            onBack={handleBackToProducts}
          />
        )}
        {currentView === 'orders' && <Orders userRole={user.role} />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'productManagement' && user.role === 'Admin' && <ProductManagement />}
        {currentView === 'userManagement' && user.role === 'Admin' && <UserManagement />}
        {showCart && (
          <Cart
            onClose={() => setShowCart(false)}
            onCheckoutSuccess={handleCheckoutSuccess}
          />
        )}
      </main>
    </div >
  );
}

export default App;
