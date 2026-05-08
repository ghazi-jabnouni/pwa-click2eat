import { useState } from 'react';
import type { FoodItem, SelectedOption } from '../types/food';
import { Star, Clock, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { FoodOptionsModal } from './FoodOptionsModal';

interface FoodCardProps {
  foodItem: FoodItem;
  onAddToCart: (item: FoodItem, quantity: number, selectedOptions?: SelectedOption[]) => void;
}

export const FoodCard = ({ foodItem, onAddToCart }: FoodCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const handleAddToCart = (selectedOptions?: SelectedOption[]) => {
    onAddToCart(foodItem, quantity, selectedOptions);
    setQuantity(1);
    setIsAdded(true);
    
    // Reset the added state after animation
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleDirectAddToCart = () => {
    if (foodItem.hasOptions) {
      setShowOptionsModal(true);
    } else {
      handleAddToCart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 max-w-sm">
      {/* Full width image */}
      <div className="relative h-32 bg-gray-50">
        {foodItem.image && foodItem.image.startsWith('http') ? (
          <img 
            src={foodItem.image} 
            alt={foodItem.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">{foodItem.image}</div>
        )}
        <div className="w-full h-full flex items-center justify-center text-4xl hidden">🍽️</div>
      </div>
      
      {/* Content below image */}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base">{foodItem.name}</h3>
            <p className="text-xs text-gray-600 line-clamp-1">{foodItem.description}</p>
            {foodItem.tags && foodItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {foodItem.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: tag.tag_color }}
                  >
                    {tag.tag_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
          
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-yellow-50 px-1 py-0.5 rounded">
              <Star size={12} className="text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-gray-700 ml-1">{foodItem.rating}</span>
            </div>
            <div className="flex items-center bg-gray-50 px-1 py-0.5 rounded">
              <Clock size={12} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-700 ml-1">{foodItem.preparationTime}m</span>
            </div>
          </div>
        </div>
        
        {/* Price and order section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-red-50 to-red-100 px-2.5 py-1.5 rounded-lg border border-red-200">
              <span className="text-lg font-bold text-red-600">${foodItem.price.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-all duration-200 group"
              >
                <Minus size={14} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
              <span className="px-2.5 py-1 font-semibold text-gray-800 min-w-[2.5rem] text-center text-sm bg-white border-x border-gray-200">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-all duration-200 group"
              >
                <Plus size={14} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
            </div>
            <button
              onClick={handleDirectAddToCart}
              className={`
                relative overflow-hidden group px-3 py-2 rounded-lg font-medium text-sm
                transition-all duration-300 transform active:scale-95
                ${isAdded 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700'
                }
              `}
            >
              <span className={`flex items-center space-x-1.5 transition-transform duration-300 ${isAdded ? 'scale-110' : ''}`}>
                {isAdded ? (
                  <>
                    <Check size={16} className="animate-pulse" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    <span>{foodItem.hasOptions ? 'Customize' : 'Add'}</span>
                  </>
                )}
              </span>
              
              {/* Ripple effect overlay */}
              <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
              
              {/* Shimmer effect for hover state */}
              {!isAdded && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Options Modal */}
      <FoodOptionsModal
        foodItem={foodItem}
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onAddToCart={(_, __, selectedOptions) => handleAddToCart(selectedOptions)}
      />
    </div>
  );
};
