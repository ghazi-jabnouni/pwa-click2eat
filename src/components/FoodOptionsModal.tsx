import { useState } from 'react';
import type { FoodItem, FoodOption, SelectedOption } from '../types/food';
import { X, Plus, Minus } from 'lucide-react';

interface FoodOptionsModalProps {
  foodItem: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: FoodItem, quantity: number, selectedOptions: SelectedOption[]) => void;
}

export const FoodOptionsModal = ({ foodItem, isOpen, onClose, onAddToCart }: FoodOptionsModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [totalPrice, setTotalPrice] = useState(foodItem.price);

  if (!isOpen || !foodItem.options) return null;

  const groupedOptions = foodItem.options.reduce((acc, option) => {
    if (!acc[option.type]) {
      acc[option.type] = [];
    }
    acc[option.type].push(option);
    return acc;
  }, {} as Record<string, FoodOption[]>);

  const handleOptionToggle = (option: FoodOption) => {
    const isSelected = selectedOptions.some(opt => opt.optionId === option.id);
    
    if (isSelected) {
      setSelectedOptions(selectedOptions.filter(opt => opt.optionId !== option.id));
      setTotalPrice(totalPrice - option.price);
    } else {
      // For single-choice options (like size or specific types), remove other selections from the same group
      if (option.maxSelections === 1) {
        const otherOptionsInGroup = selectedOptions.filter(opt => 
          !foodItem.options?.find(o => o.id === opt.optionId && o.type === option.type)
        );
        const removedPrice = selectedOptions
          .filter(opt => foodItem.options?.find(o => o.id === opt.optionId && o.type === option.type))
          .reduce((sum, opt) => sum + opt.price, 0);
        
        setSelectedOptions([...otherOptionsInGroup, { 
          optionId: option.id, 
          name: option.name, 
          price: option.price,
          type: option.type
        }]);
        setTotalPrice(totalPrice - removedPrice + option.price);
      } else {
        // For multi-choice, check if we reached maxSelections
        const currentInGroup = selectedOptions.filter(opt => 
          foodItem.options?.find(o => o.id === opt.optionId && o.type === option.type)
        );
        
        if (option.maxSelections && currentInGroup.length >= option.maxSelections) {
          // Could show a toast here, but for now just prevent selection
          return;
        }

        setSelectedOptions([...selectedOptions, { 
          optionId: option.id, 
          name: option.name, 
          price: option.price,
          type: option.type
        }]);
        setTotalPrice(totalPrice + option.price);
      }
    }
  };

  const handleAddToCart = () => {
    onAddToCart(foodItem, quantity, selectedOptions);
    setSelectedOptions([]);
    setQuantity(1);
    setTotalPrice(foodItem.price);
    onClose();
  };

  const getOptionLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'size': return 'Size';
      case 'extra': return 'Extras';
      case 'customization': return 'Customizations';
      case 'ingredient': return 'Ingredients';
      default: return type; // Return the group name as is
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{foodItem.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{foodItem.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-6">
          {Object.entries(groupedOptions).map(([type, options]) => (
            <div key={type}>
              <h3 className="font-semibold text-gray-900 mb-3">{getOptionLabel(type)}</h3>
              <div className="space-y-2">
                {options.map(option => {
                  const isSelected = selectedOptions.some(opt => opt.optionId === option.id);
                  const isSingleChoice = option.maxSelections === 1;
                  const displayPrice = option.price === 0 ? '' : 
                    option.price > 0 ? `+$${option.price.toFixed(2)}` : `-$${Math.abs(option.price).toFixed(2)}`;
                  
                  return (
                    <label
                      key={option.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type={isSingleChoice ? 'radio' : 'checkbox'}
                          name={isSingleChoice ? `group-${option.type}-${foodItem.id}` : option.id}
                          checked={isSelected}
                          onChange={() => handleOptionToggle(option)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="font-medium text-gray-900">{option.name}</span>
                      </div>
                      {displayPrice && (
                        <span className={`text-sm font-medium ${
                          option.price > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {displayPrice}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-gray-600">Quantity:</span>
              <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-colors"
                >
                  <Minus size={14} className="text-gray-600" />
                </button>
                <span className="px-3 py-1 font-semibold text-gray-800 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-colors"
                >
                  <Plus size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total:</div>
              <div className="text-xl font-bold text-red-600">
                ${(totalPrice * quantity).toFixed(2)}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add to Cart • ${(totalPrice * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};
