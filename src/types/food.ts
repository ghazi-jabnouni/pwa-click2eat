export interface FoodOption {
  id: string;
  name: string;
  price: number;
  type: 'size' | 'ingredient' | 'extra' | 'customization';
  isRequired?: boolean;
  maxSelections?: number;
  minSelections?: number;
}

export interface FoodTag {
  id: number;
  tag_name: string;
  tag_color: string;
  tag_slug: string;
  icon?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  preparationTime: number;
  isAvailable: boolean;
  options?: FoodOption[];
  hasOptions?: boolean;
  tags?: FoodTag[];
}

export interface SelectedOption {
  optionId: string;
  name: string;
  price: number;
  type: 'size' | 'ingredient' | 'extra' | 'customization';
}

export interface CartItem extends FoodItem {
  quantity: number;
  selectedOptions?: SelectedOption[];
  totalPrice: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
}
