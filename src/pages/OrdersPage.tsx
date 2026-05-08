import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Package, RefreshCcw, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface OrderItem {
  item_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  created_at: string;
  total_amount: number;
  items?: OrderItem[] | string;
}


export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdate = () => {
      fetchOrders();
    };

    window.addEventListener('order-updated', handleOrderUpdate);

    return () => {
      window.removeEventListener('order-updated', handleOrderUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.getSessionOrders(sessionId);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, any> = {
    'PENDING': { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
    'PREPARING': { icon: Package, color: 'text-blue-600', label: 'Preparing' },
    'READY': { icon: CheckCircle, color: 'text-green-600', label: 'Ready for Pickup' },
    'COMPLETED': { icon: CheckCircle, color: 'text-gray-600', label: 'Completed' },
    'CANCELLED': { icon: XCircle, color: 'text-red-600', label: 'Cancelled' },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <button onClick={fetchOrders} className="text-gray-500">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600">Scan a QR code to start ordering!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const config = statusConfig[order.status] || statusConfig['PENDING'];
              const StatusIcon = config.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className={`flex items-center ${config.color}`}>
                      <StatusIcon size={18} className="mr-1" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {config.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="space-y-2 mb-3">
                      {(() => {
                        try {
                          const items = typeof order.items === 'string' 
                            ? JSON.parse(`[${order.items}]`) 
                            : order.items;
                          
                          return Array.isArray(items) && items.map((item, idx) => (
                            <div key={idx} className="mb-2 last:mb-0">
                              <div className="flex justify-between text-sm">
                                <span className="font-semibold text-gray-800">
                                  {item.quantity}x {item.item_name}
                                </span>
                                <span className="text-gray-900 font-bold">
                                  ${(parseFloat(item.price as any) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              
                              {/* Structured Customizations */}
                              <div className="ml-4 mt-0.5 space-y-0.5">
                                {(item as any).customizations ? (() => {
                                  try {
                                    const data = typeof (item as any).customizations === 'string' 
                                      ? JSON.parse((item as any).customizations) 
                                      : (item as any).customizations;
                                    
                                    const groups = data.groups || (Array.isArray(data) ? data : null);
                                    
                                    if (groups && Array.isArray(groups)) {
                                      return groups.map((group: any, gIdx: number) => (
                                        <div key={gIdx} className="text-[10px] text-gray-500 leading-tight">
                                          <span className="font-bold">[{group.group_name}]:</span>{' '}
                                          {group.items.map((i: any) => i.name).join(', ')}
                                        </div>
                                      ));
                                    }
                                  } catch (e) { return null; }
                                  return null;
                                })() : (item as any).modifications && (
                                  <span className="block text-[10px] text-gray-500 font-normal italic">
                                    { (item as any).modifications }
                                  </span>
                                )}
                              </div>
                            </div>
                          ));
                        } catch (e) {
                          return <p className="text-xs text-red-400">Error loading items</p>;
                        }
                      })()}
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm font-semibold">Total Amount</span>
                      <span className="font-bold text-red-600">
                        ${parseFloat(order.total_amount as any).toFixed(2)}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest">
                      {order.status === 'COMPLETED' ? 'Total Paid' : 'Kitchen is working on your meal'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
