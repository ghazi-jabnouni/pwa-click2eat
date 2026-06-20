import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { BottomNavigation } from './components/BottomNavigation';
import { useCart } from './hooks/useCart';
import { apiService } from './services/api';
import { socketService } from './services/socket';
import { playNotificationSound } from './utils/sound';

function App() {
  const cart = useCart();
  const [initializing, setInitializing] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const isPrettyUrl = window.location.pathname.includes('/org/') || pathSegments.length >= 4;
    return !!urlParams.get('service_id') || isPrettyUrl;
  });
  const [notification, setNotification] = useState<{message: string, id: number} | null>(null);

  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('order_status_changed', (data: any) => {
      const currentSessionId = localStorage.getItem('session_id');
      
      if (currentSessionId && String(data.session_id) === currentSessionId) {
        playNotificationSound();
        const msgId = Date.now();
        setNotification({
          message: `Order #${data.order_id} is now ${data.new_status}`,
          id: msgId
        });
        
        // Dispatch custom event so OrdersPage can refresh
        window.dispatchEvent(new CustomEvent('order-updated'));
        
        setTimeout(() => {
          setNotification(prev => prev?.id === msgId ? null : prev);
        }, 5000);
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Audio Unlock Logic: Browsers block sound until first interaction
  useEffect(() => {
    const unlockAudio = () => {
      playNotificationSound(true); // Attempt to play silently to unlock context
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      console.log('Audio unlocked for notifications');
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceIdFromParams = urlParams.get('service_id');
      const tableIdFromParams = urlParams.get('table_id');
      const areaIdFromParams = urlParams.get('area_id');

      // Check for pretty URL format: /org/:orgSlug/:serviceSlug/:areaSlug/:tableId
      // Or: /:orgSlug/:serviceSlug/:areaSlug/:tableId
      const pathParts = window.location.pathname.split('/');
      let tableIdFromPath = null;
      let orgSlugFromPath = null;
      let serviceSlugFromPath = null;
      
      if (pathParts.length >= 6 && pathParts[1] === 'org') {
        orgSlugFromPath = decodeURIComponent(pathParts[2]);
        serviceSlugFromPath = decodeURIComponent(pathParts[3]);
        tableIdFromPath = pathParts[5];
      } else if (pathParts.length >= 5 && pathParts[1] !== 'cart' && pathParts[1] !== 'orders' && pathParts[1] !== 'profile') {
        orgSlugFromPath = decodeURIComponent(pathParts[1]);
        serviceSlugFromPath = decodeURIComponent(pathParts[2]);
        tableIdFromPath = pathParts[4];
      }

      const effectiveServiceId = (serviceIdFromParams && !isNaN(parseInt(serviceIdFromParams))) ? parseInt(serviceIdFromParams) : undefined;
      const effectiveTableIdString = tableIdFromParams || tableIdFromPath;
      const effectiveTableId = (effectiveTableIdString && !isNaN(parseInt(effectiveTableIdString))) ? parseInt(effectiveTableIdString) : undefined;

      if (effectiveServiceId || effectiveTableId) {
        try {
          setInitializing(true);
          // Create session on backend
          const session = await apiService.createClientSession({
            service_id: effectiveServiceId as number,
            table_id: effectiveTableId,
            org_slug: orgSlugFromPath || undefined,
            service_slug: serviceSlugFromPath || undefined
          });

          if (session.session_id) {
            localStorage.setItem('session_id', session.session_id);
            if (session.service_id) localStorage.setItem('service_id', session.service_id.toString());
            if (effectiveTableId) localStorage.setItem('table_id', effectiveTableId.toString());
            if (areaIdFromParams) localStorage.setItem('area_id', areaIdFromParams);
          }

          // Clean up URL parameters (optional, keeps UI clean)
          window.history.replaceState({}, '', window.location.pathname);
        } catch (error) {
          console.error('Failed to initialize session:', error);
        } finally {
          setInitializing(false);
        }
      } else {
        // If no URL info, check if we have a saved session
        const savedSessionId = localStorage.getItem('session_id');
        if (savedSessionId) {
          setInitializing(false);
        }
      }
    };

    initializeSession();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing your menu...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="relative min-h-screen pb-16">
        {notification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce font-medium text-center">
            🔔 {notification.message}
          </div>
        )}
        <Routes>
          <Route path="/" element={<MenuPage cart={cart} />} />
          <Route path="/org/:orgSlug/:serviceSlug/:areaSlug/:tableId" element={<MenuPage cart={cart} />} />
          <Route path="/:orgSlug/:serviceSlug/:areaSlug/:tableId" element={<MenuPage cart={cart} />} />
          <Route path="/cart" element={<CartPage cart={cart} />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage cart={cart} />} />
        </Routes>
        <BottomNavigation cartItemsCount={cart.getTotalItems()} />
      </div>
    </Router>
  );
}

export default App;
