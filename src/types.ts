export enum UserRole {
  CUSTOMER = "CUSTOMER",
  TAILOR = "TAILOR",
  SUPPLIER = "SUPPLIER",
  DELIVERY = "DELIVERY"
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  role: UserRole;
  avatarUrl?: string;
}

export type ClothingCategory =
  | "shirt"
  | "pants"
  | "dress"
  | "jacket"
  | "suit"
  | "cap"
  | "bag"
  | "abaya"
  | "shoes"
  | "accessories";

export interface Measurements {
  height: number; // cm
  weight?: number; // kg
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  shoulder?: number; // cm
  sleeve?: number; // cm
  inseam?: number; // cm
  preferredSize: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "Custom";
}

export type OrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface Customizations {
  color: string;
  fabricId?: string;
  fabricName?: string;
  embroidery?: string;
  buttonType?: string;
  collarStyle?: string;
  sleeveStyle?: string;
  pocketStyle?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  tailorId?: string;
  tailorName?: string;
  supplierId?: string;
  deliveryPartnerId?: string;
  category: ClothingCategory;
  templateId?: string;
  templateTitle?: string;
  customizations: Customizations;
  measurements: Measurements;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryNotes?: string;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "CASH_ON_DELIVERY";
  paymentMethod: "CREDIT_CARD" | "CASH_ON_DELIVERY";
  paymentReference?: string;
  totalPrice: number;
  estimatedCompletion?: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface Fabric {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  category: string; // Cotton, Wool, Silk, Denim, Linen, Chiffon, etc.
  color: string;
  colorHex: string;
  pricePerMeter: number;
  stock: number; // meters available
  description?: string;
  imageUrl?: string;
  fiberComposition?: string;
}

export interface MarketplaceDesign {
  id: string;
  designerId: string;
  designerName: string;
  title: string;
  description: string;
  category: ClothingCategory;
  price: number;
  imageUrl: string;
  isSold: boolean;
  buyerId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  orderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  linkTo: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIDesignRequest {
  occasion: string;
  style: string;
  bodyType: string;
  fabric: string;
  budget: number;
  colors: string[];
}

export interface AIDesignResult {
  title: string;
  description: string;
  colors: string[];
  fabrics: string[];
  estimatedPrice: number;
  steps: string[];
  visualPrompt: string;
}
