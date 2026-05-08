import { useState } from 'react';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { CartItem } from '../types/food';

interface CartPageProps {
  cart: {
    items: CartItem[];
    updateQuantity: (uniqueId: string, quantity: number) => void;
    removeItem: (uniqueId: string) => void;
    getTotal: () => number;
    clearCart: () => void;
  };
}

export const CartPage = ({ cart }: CartPageProps) => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = cart;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      setError('No active session. Please scan a QR code first.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const orderData = {
        items: items.map(item => {
          // Group by customization group name
          const groups = item.selectedOptions?.reduce((acc, opt) => {
            const groupName = opt.type || 'General';
            const group = acc.find(g => g.group_name === groupName);
            if (group) {
              group.items.push({ 
                id: opt.optionId,
                name: opt.name, 
                price: opt.price 
              });
            } else {
              acc.push({
                group_name: groupName,
                items: [{ 
                  id: opt.optionId,
                  name: opt.name, 
                  price: opt.price 
                }]
              });
            }
            return acc;
          }, [] as any[]);

          const structuredCustomizations = {
            item_name: item.name,
            groups: groups || []
          };

          // Legacy flat strings for backward compatibility/quick display
          const extras = item.selectedOptions?.filter(o => o.type.toLowerCase().includes('extra')).map(o => o.name).join(', ') || null;
          const removed = item.selectedOptions?.filter(o => o.type.toLowerCase().includes('ingredient') && o.price < 0).map(o => o.name).join(', ') || null;
          const others = item.selectedOptions?.filter(o => !o.type.toLowerCase().includes('extra') && !(o.type.toLowerCase().includes('ingredient') && o.price < 0)).map(o => o.name).join(', ') || null;
          
          return {
            item_id: parseInt(item.id),
            item_name: item.name,
            quantity: item.quantity,
            price: item.totalPrice || item.price,
            customizations: structuredCustomizations, // Full JSON object
            extra_ingredients: extras,
            removed_ingredients: removed,
            modifications: others,
            special_instructions: ""
          };
        }),
        special_instructions: "Order from PWA"
      };

      const response = await apiService.placeOrder(sessionId, orderData);
      
      if (response.order_id) {
        clearCart();
        navigate('/orders');
      }
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600">Add some delicious items to get started!</p>
        </div>
      </div>
    );
  }

  const CartItemDisplay = ({ item }: { item: CartItem }) => (
    <div key={`${item.id}-${JSON.stringify(item.selectedOptions?.map(opt => opt.optionId).sort() || [])}`} className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
      <div className="flex items-center space-x-4">
        <div className="text-3xl flex-shrink-0">
            {item.image && item.image.startsWith('http') ? (
              <img 
                src={item.image} 
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : (
              <span>{item.image || '🍽️'}</span>
            )}
          </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-red-600 font-bold">${(item.totalPrice || item.price).toFixed(2)}</span>
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <span className="text-xs text-gray-500">• Customized</span>
            )}
          </div>
          
          {/* Display selected options */}
          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.selectedOptions.map(option => (
                <span 
                  key={option.optionId}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                >
                  {option.name}
                  {option.price !== 0 && (
                    <span className={option.price > 0 ? 'text-green-600' : 'text-red-600'}>
                      {option.price > 0 ? ' +$' : ' -$'}{Math.abs(option.price).toFixed(2)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateQuantity(`${item.id}-${JSON.stringify(item.selectedOptions?.map(opt => opt.optionId).sort() || [])}`, item.quantity - 1)}
            className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(`${item.id}-${JSON.stringify(item.selectedOptions?.map(opt => opt.optionId).sort() || [])}`, item.quantity + 1)}
            className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => removeItem(`${item.id}-${JSON.stringify(item.selectedOptions?.map(opt => opt.optionId).sort() || [])}`)}
            className="p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors ml-2"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="font-semibold">
            ${((item.totalPrice || item.price) * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="space-y-4">
          {items.map(item => (
            <CartItemDisplay key={`${item.id}-${JSON.stringify(item.selectedOptions?.map(opt => opt.optionId).sort() || [])}`} item={item} />
          ))}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Tax & Fees</span>
              <span>${(getTotal() * 0.1).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-red-600">
                  ${(getTotal() * 1.1).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button 
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Placing Order...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
