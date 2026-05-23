import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { BackendFoodItem } from '../services/api';
import type { FoodItem } from '../types/food';

// Transform backend food item to frontend format
const transformFoodItem = (backendItem: BackendFoodItem): FoodItem => {
  // Backend returns mi.* plus images (comma separated string)
  const backendImages = (backendItem as any).images;
  const imageUrl = (backendItem as any).image_url || backendItem.image || (backendImages ? backendImages.split(',')[0] : null);
  
  let fullImageUrl = imageUrl;

  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.match(/^[\u1F600-\u1F64F]/)) {
    // If it's a relative path or just a filename
    const prefix = imageUrl.startsWith('/') ? '' : '/uploads/dishes/';
    const imageBase = import.meta.env.VITE_IMAGE_BASE_URL;
    fullImageUrl = `${imageBase}${prefix}${imageUrl}`;
  } else if (!imageUrl || imageUrl === '🍽️' || imageUrl === '🍔' || imageUrl === '🍕' || imageUrl === '🥗' || imageUrl === '🍗' || imageUrl === '🍝' || imageUrl === '🍟' || imageUrl === '🍨' || imageUrl === '☕') {
    // Premium placeholder images based on item name as fallback
    const searchQuery = encodeURIComponent(backendItem.item_name || 'food');
    fullImageUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&sig=${backendItem.id}&search=${searchQuery}`;
    // Actually, Unsplash Source (legacy) or just a static high-res food image works better
    // Let's use a curated collection of high-res food images
    const foodImages = [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929'
    ];
    fullImageUrl = `${foodImages[backendItem.id % foodImages.length]}?w=500&auto=format&fit=crop&q=60`;
  }

  // Map customization groups to FoodOptions
  const options: any[] = [];
  if (backendItem.customization_groups && backendItem.customization_groups.length > 0) {
    backendItem.customization_groups.forEach(group => {
      if (group.items && Array.isArray(group.items)) {
        group.items.forEach(item => {
          options.push({
            id: item.id.toString(),
            name: item.item_name,
            price: typeof item.extra_price === 'string' ? parseFloat(item.extra_price) : item.extra_price,
            // Use the group name as the type
            type: group.group_name,
            isRequired: Boolean(group.is_required),
            maxSelections: group.max_choices,
            minSelections: group.min_choices
          });
        });
      }
    });
  }

  return {
    id: backendItem.id.toString(),
    name: backendItem.item_name,
    description: backendItem.description || 'Delicious food item',
    price: typeof backendItem.price === 'string' ? parseFloat(backendItem.price) : backendItem.price,
    category: backendItem.category_id.toString(), // Will be mapped to category name
    image: fullImageUrl || '🍽️',
    rating: 4.5,
    preparationTime: 15,
    isAvailable: backendItem.is_active !== false,
    options: options.length > 0 ? options : undefined,
    hasOptions: options.length > 0,
    tags: backendItem.tags || [],
  };
};

// Get service ID from session or URL params
const getServiceId = (): number | null => {
  // Try to get from URL params first
  const urlParams = new URLSearchParams(window.location.search);
  const serviceIdParam = urlParams.get('service_id');
  if (serviceIdParam) {
    return parseInt(serviceIdParam);
  }

  // Try to get from local storage
  const serviceId = localStorage.getItem('service_id');
  if (serviceId) {
    return parseInt(serviceId);
  }

  return null;
};

export const useFoodData = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get service ID
      const serviceId = getServiceId();
      if (!serviceId) {
        throw new Error('No service specified. Please scan a QR code.');
      }

      // Fetch full menu and tags from backend
      const [menuData, tagsData] = await Promise.all([
        apiService.getServiceMenu(serviceId),
        apiService.getAllTags()
      ]);
      
      setAllTags(tagsData);
      
      // Extract categories and items
      const categoriesList: string[] = menuData.categories.map((cat: any) => cat.name || cat.category_name);
      const allItems: FoodItem[] = [];

      menuData.categories.forEach((cat: any) => {
        const categoryName = cat.name || cat.category_name;
        cat.items.forEach((item: any) => {
          allItems.push({
            ...transformFoodItem(item),
            category: categoryName
          });
        });
      });

      setFoodItems(allItems);
      setCategories(categoriesList);

    } catch (err: any) {
      console.error('Failed to fetch food data:', err);
      setError(err.message || 'Failed to load menu. Please try again.');
      
      // Fallback to mock data if API fails (useful for development/testing)
      if (err.message.includes('No service specified') || err.message.includes('not found')) {
         const { foodItems: mockItems } = await import('../data/foodData');
         setFoodItems(mockItems);
         setCategories(Array.from(new Set(mockItems.map(item => item.category))));
      }
    } finally {
      setLoading(false);
    }
  };

  const searchFoodItems = async (query: string): Promise<FoodItem[]> => {
    try {
      const results = await apiService.searchFoodItems(query);
      return results.map(transformFoodItem);
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback to client-side filtering
      return foodItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  };

  const getFoodItemsByCategory = async (categoryName: string): Promise<FoodItem[]> => {
    return foodItems.filter(item => item.category === categoryName);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    foodItems,
    categories,
    allTags,
    loading,
    error,
    refetch: fetchData,
    searchFoodItems,
    getFoodItemsByCategory,
  };
};
