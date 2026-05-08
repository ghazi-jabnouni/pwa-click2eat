import { useState, useEffect } from 'react';
import { FoodCard } from '../components/FoodCard';
import { useFoodData } from '../hooks/useFoodData';
import { Search } from 'lucide-react';
import type { FoodItem, SelectedOption } from '../types/food';

interface MenuPageProps {
  cart: {
    addItem: (item: FoodItem, quantity: number, selectedOptions?: SelectedOption[]) => void;
  };
}

export const MenuPage = ({ cart }: MenuPageProps) => {
  const { foodItems, categories, allTags, loading, error, searchFoodItems } = useFoodData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    let baseItems = foodItems;

    // Filter by Category
    if (selectedCategory !== 'All') {
      baseItems = baseItems.filter(item => item.category === selectedCategory);
    }

    // Filter by Tag
    if (selectedTag) {
      baseItems = baseItems.filter(item => 
        item.tags?.some(tag => tag.tag_slug === selectedTag)
      );
    }

    // Filter by Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      baseItems = baseItems.filter(item => 
        item.name.toLowerCase().includes(lowerSearch) || 
        item.description.toLowerCase().includes(lowerSearch) ||
        item.tags?.some(tag => tag.name.toLowerCase().includes(lowerSearch))
      );
    }

    setFilteredItems(baseItems);
  }, [searchTerm, selectedCategory, selectedTag, foodItems]);

  const handleAddToCart = (item: FoodItem, quantity: number, selectedOptions?: SelectedOption[]) => {
    cart.addItem(item, quantity, selectedOptions);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold border transition-all ${
                  selectedTag === null
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                All Labels
              </button>
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(selectedTag === tag.tag_slug ? null : tag.tag_slug)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold border transition-all ${
                    selectedTag === tag.tag_slug
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  style={selectedTag === tag.tag_slug ? { backgroundColor: tag.tag_color } : {}}
                >
                  {tag.tag_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">⏳</div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <p className="text-gray-600">No items found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => (
              <FoodCard
                key={item.id}
                foodItem={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
