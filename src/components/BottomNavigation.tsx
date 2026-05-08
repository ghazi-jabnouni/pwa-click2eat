import { Home, ShoppingCart, Receipt, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const navigationItems = [
  { name: 'Menu', href: '/', icon: Home },
  { name: 'Cart', href: '/cart', icon: ShoppingCart },
  { name: 'Orders', href: '/orders', icon: Receipt },
  { name: 'Profile', href: '/profile', icon: User },
];

interface BottomNavigationProps {
  cartItemsCount?: number;
}

export const BottomNavigation = ({ cartItemsCount = 0 }: BottomNavigationProps) => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          const hasBadge = item.name === 'Cart' && cartItemsCount > 0;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-red-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon size={24} />
                {hasBadge && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
