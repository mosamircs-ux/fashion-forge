import { 
  User, 
  Order, 
  Fabric, 
  MarketplaceDesign, 
  Message, 
  AppNotification, 
  AIDesignRequest,
  AIDesignResult
} from "../types";

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const api = {
  // Users
  getUsers: () => fetchJson<User[]>("/api/users"),
  getUser: (id: string) => fetchJson<User>(`/api/users/${id}`),
  updateUser: (id: string, data: Partial<User>) => 
    fetchJson<User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  // Orders
  getOrders: (params?: { customerId?: string; tailorId?: string; deliveryPartnerId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchJson<Order[]>(`/api/orders?${query}`);
  },
  getOrder: (id: string) => fetchJson<Order>(`/api/orders/${id}`),
  createOrder: (data: Partial<Order>) => 
    fetchJson<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  updateOrder: (id: string, data: Partial<Order>) => 
    fetchJson<Order>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),

  // Fabrics
  getFabrics: () => fetchJson<Fabric[]>("/api/fabrics"),
  createFabric: (data: Partial<Fabric>) => 
    fetchJson<Fabric>("/api/fabrics", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  updateFabric: (id: string, data: Partial<Fabric>) => 
    fetchJson<Fabric>(`/api/fabrics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  deleteFabric: (id: string) => 
    fetchJson<Fabric>(`/api/fabrics/${id}`, {
      method: "DELETE"
    }),

  // Marketplace
  getMarketplace: () => fetchJson<MarketplaceDesign[]>("/api/marketplace"),
  createMarketplaceListing: (data: Partial<MarketplaceDesign>) => 
    fetchJson<MarketplaceDesign>("/api/marketplace", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  purchaseDesign: (data: { 
    designId: string; 
    buyerId: string; 
    buyerName: string; 
    deliveryAddress: string; 
    paymentMethod: string; 
  }) => 
    fetchJson<{ success: boolean; order: Order; design: MarketplaceDesign }>("/api/marketplace/purchase", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Messages
  getMessages: (orderId: string) => fetchJson<Message[]>(`/api/messages/${orderId}`),
  sendMessage: (data: { 
    senderId: string; 
    senderName: string; 
    receiverId: string; 
    receiverName: string; 
    orderId: string; 
    content: string; 
  }) => 
    fetchJson<Message>("/api/messages", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Notifications
  getNotifications: (userId: string) => fetchJson<AppNotification[]>(`/api/notifications/${userId}`),
  markNotificationsAsRead: (id?: string, userId?: string) => 
    fetchJson<{ success: boolean }>("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ id, userId })
    }),

  // AI Generator Secure API Bridge
  generateAIDesign: (req: AIDesignRequest) => 
    fetchJson<{ success: boolean; simulation: boolean; errorMsg?: string; data: AIDesignResult }>("/api/ai/generate", {
      method: "POST",
      body: JSON.stringify(req)
    })
};
