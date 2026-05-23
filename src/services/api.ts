const API_BASE_URL = import.meta.env.VITE_API_URL; // Loaded from environment variable

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  categories?: T;
  items?: T;
  item?: T;
  session?: T;
}

export interface FoodCategory {
  id: number;
  category_name: string;
  display_order?: number;
  is_active?: boolean;
}

export interface BackendCustomizationItem {
  id: number;
  customization_group_id: number;
  item_name: string;
  item_type: 'OPTION' | 'REQUIRED' | 'EXCLUDE';
  extra_price: number | string;
  is_active: boolean;
}

export interface BackendCustomizationGroup {
  id: number;
  menu_item_id: number;
  group_name: string;
  is_required: boolean | number;
  min_choices: number;
  max_choices: number;
  items: BackendCustomizationItem[];
}

// Food items from backend (matching your backend schema)
export interface BackendFoodItem {
  id: number;
  item_name: string;
  description?: string;
  price: number;
  category_id: number;
  image?: string;
  is_active?: boolean;
  customization_groups?: BackendCustomizationGroup[];
  discounted_price?: number | string;
  active_offer?: any;
  images?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error ? `${data.message}: ${data.error}` : (data.message || `HTTP error! status: ${response.status}`);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Scan QR code
  async scanQRCode(qrCode: string): Promise<any> {
    const response = await this.request<any>(`/qr/scan/${encodeURIComponent(qrCode)}`);
    return response.data;
  }

  // Get full menu (categories + items)
  async getServiceMenu(serviceId: number): Promise<any> {
    const response = await this.request<any>(`/services/${serviceId}/menu`);
    return response.data;
  }

  // Get all tags
  async getAllTags(): Promise<any[]> {
    const response = await this.request<any[]>('/tags');
    return response.data || [];
  }

  // Create client session
  async createClientSession(data: { 
    service_id: number; 
    table_id?: number; 
    customer_name?: string;
    org_slug?: string;
    service_slug?: string;
  }): Promise<any> {
    const response = await this.request<any>('/session/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Place order
  async placeOrder(sessionId: string, orderData: { items: any[]; special_instructions?: string }): Promise<any> {
    const response = await this.request<any>(`/session/${sessionId}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  }

  // Get session orders
  async getSessionOrders(sessionId: string): Promise<any[]> {
    const response = await this.request<any>(`/session/${sessionId}/orders`);
    return response.data || [];
  }

  // Get order status
  async getOrderStatus(orderId: number): Promise<any> {
    const response = await this.request<any>(`/orders/${orderId}/status`);
    return response.data;
  }

  // Legacy/Compatibility methods (can be refactored later)
  async getCategories(serviceId?: number): Promise<FoodCategory[]> {
    if (!serviceId) return [];
    const menu = await this.getServiceMenu(serviceId);
    return menu.categories || [];
  }

  async getFoodItems(serviceId?: number): Promise<BackendFoodItem[]> {
    if (!serviceId) return [];
    const menu = await this.getServiceMenu(serviceId);
    // Flatten all items from categories
    return menu.categories.reduce((acc: any[], cat: any) => [...acc, ...cat.items], []);
  }

  async searchFoodItems(query: string, serviceId?: number): Promise<BackendFoodItem[]> {
    const allItems = await this.getFoodItems(serviceId);
    return allItems.filter(item => 
      item.item_name.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    );
  }
}

export const apiService = new ApiService();
