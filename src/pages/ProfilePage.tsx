import { User, Phone, MapPin, Settings, LogOut, HelpCircle, CreditCard } from 'lucide-react';

interface ProfilePageProps {
  cart?: any;
}

export const ProfilePage = ({ cart }: ProfilePageProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <User size={40} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
              <p className="text-gray-600">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-gray-400" />
                <span className="text-gray-700">+1 234 567 8900</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-gray-400" />
                <span className="text-gray-700">123 Main St, City, State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <CreditCard size={20} className="text-gray-400" />
                <span className="text-gray-700">Payment Methods</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-gray-400" />
                <span className="text-gray-700">Delivery Addresses</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Settings size={20} className="text-gray-400" />
                <span className="text-gray-700">Preferences</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <HelpCircle size={20} className="text-gray-400" />
                <span className="text-gray-700">Help & Support</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>

        <button className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
