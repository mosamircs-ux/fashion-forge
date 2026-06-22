import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Scissors, 
  Truck, 
  Layers, 
  Menu, 
  Bell, 
  MessageSquare, 
  Clock, 
  DollarSign, 
  ShoppingBag, 
  MapPin, 
  Ruler, 
  Loader2, 
  User, 
  Trash2, 
  Tag,
  CheckCircle,
  AlertCircle,
  FileDown,
  X,
  Eye,
  Info
} from "lucide-react";
import { jsPDF } from "jspdf";
import { api } from "./lib/api";
import { 
  User as UserType, 
  UserRole, 
  Order, 
  Fabric, 
  MarketplaceDesign, 
  Message, 
  AppNotification,
  OrderStatus
} from "./types";

import RoleSwitcher from "./components/RoleSwitcher";
import AIDesignStudio from "./components/AIDesignStudio";
import VirtualTryOn from "./components/VirtualTryOn";
import CairoMap from "./components/CairoMap";
import OrderWizard from "./components/OrderWizard";
import Marketplace from "./components/Marketplace";

const getFabricComposition = (fab: Fabric) => {
  if (fab.fiberComposition && fab.fiberComposition.trim()) return fab.fiberComposition;
  const category = (fab.category || "").toLowerCase();
  if (category.includes("cotton")) return "100% Giza Egyptian Long-Staple Cotton";
  if (category.includes("linen")) return "100% Premium Mediterranean Flax Linen";
  if (category.includes("wool")) return "85% Australian Merino Virgin Wool, 15% Cashmere";
  if (category.includes("denim")) return "98% Long-Staple Indigo Cotton Denim, 2% Elastane";
  if (category.includes("silk")) return "100% Pure Mulberry Silk Weave (19 Momme)";
  return "100% Premium Haute-Couture Tailoring Fiber";
};

const getFabricSuitedClothing = (fab: Fabric) => {
  const category = (fab.category || "").toLowerCase();
  if (category.includes("cotton")) return ["Bespoke Dress Shirts", "Summery Pleated Dresses", "Premium Inner Lining"];
  if (category.includes("linen")) return ["Relaxed Trousers", "Light Summer Jackets", "Traditional Guayaberas"];
  if (category.includes("wool")) return ["Structured Garment Blazers", "Heavy Winter Overcoats", "Formal Suit Pants"];
  if (category.includes("denim")) return ["Rugged Utility Jackets", "Custom Heavy-Duty Jeans", "Tailored Shirt-Jackets"];
  if (category.includes("silk")) return ["Couture Evening Gowns", "Exquisite Blazer Linings", "Bespoke Neckties & Pocket Squares"];
  return ["General Custom Outfits", "Accents and Accessories"];
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentUserId, setCurrentUserId] = useState("cust_alex");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Global state arrays
  const [orders, setOrders] = useState<Order[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [designs, setDesigns] = useState<MarketplaceDesign[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Loading & interactive states
  const [dataLoading, setDataLoading] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Chat state inside order detail
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newChatText, setNewChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Supplier forms
  const [showAddFabricForm, setShowAddFabricForm] = useState(false);
  const [fabName, setFabName] = useState("");
  const [fabCat, setFabCat] = useState("Cotton");
  const [fabColor, setFabColor] = useState("Emerald Mist");
  const [fabHex, setFabHex] = useState("#A2E8DD");
  const [fabPrice, setFabPrice] = useState(280);
  const [fabStock, setFabStock] = useState(150);
  const [fabDesc, setFabDesc] = useState("");
  const [fabComp, setFabComp] = useState("");
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);

  useEffect(() => {
    fetchMainUser();
  }, [currentUserId]);

  useEffect(() => {
    if (currentUser) {
      loadEcosystemData();
    }
  }, [currentUser, activeTab]);

  const fetchMainUser = async () => {
    try {
      const user = await api.getUser(currentUserId);
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to load user archetype:", err);
    }
  };

  const downloadOrderSummary = (order: Order) => {
    if (!order) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Color theme colors: Deep navy, charcoal, light gray, soft accent
    const colPrimary = [44, 62, 80] as const; // Deep Charcoal/Navy
    const colSecondary = [52, 152, 219] as const; // Blue Accent
    const colDarkText = [44, 44, 44] as const; // Text Dark Gray
    const colLightBg = [245, 247, 250] as const; // Light slate bg
    const colBorder = [220, 224, 230] as const; // Soft gray borders

    // 1. PAGE HEADER (Elegant title & branding block)
    // Draw top brand bar
    doc.setFillColor(colPrimary[0], colPrimary[1], colPrimary[2]);
    doc.rect(0, 0, 210, 32, "F");

    // Brand text
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FASHION FORGE", 15, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(230, 126, 34); // Sunset orange subtitle accent
    doc.text("BESPOKE ATELIER NETWORK • CAIRO, EGYPT", 15, 24);

    // Document header info on right of brand bar
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`CODE: ${order.orderNumber}`, 195, 14, { align: "right" });
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Created: ${new Date(order.createdAt).toLocaleDateString()}`, 195, 20, { align: "right" });
    doc.text(`Status: ${order.status.replace(/_/g, " ")}`, 195, 25, { align: "right" });

    let y = 45; // Start vertical offset

    // Helper to draw clean sections
    const drawSectionHeader = (title: string, yOffset: number) => {
      doc.setFillColor(colPrimary[0], colPrimary[1], colPrimary[2]);
      doc.rect(15, yOffset, 180, 7, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(title, 20, yOffset + 5);
      return yOffset + 14;
    };

    // Helper to draw key-value lines
    const drawRowValue = (label: string, value: string, labelX: number, valueX: number, yOffset: number) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 110, 120);
      doc.text(label, labelX, yOffset);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(colDarkText[0], colDarkText[1], colDarkText[2]);
      doc.text(value, valueX, yOffset);
    };

    // 2. CLIENT & ATELIER INFO
    y = drawSectionHeader("I. BESPOKE ENGAGEMENT PARTIES", y);
    
    // Draw columns
    drawRowValue("Customer:", order.customerName, 17, 39, y);
    drawRowValue("Tailor Atelier:", order.tailorName || "Marco Rossi (The Tailor Shop)", 110, 138, y);
    
    y += 7;
    drawRowValue("Client Code:", order.customerId, 17, 39, y);
    drawRowValue("Supplier Source:", order.supplierId ? "Egyptian Cotton Supplier" : "Assigned Local Silk/Linen Roll", 110, 138, y);

    y += 12;

    // 3. SILHOUETTE DESIGN SELECTION
    y = drawSectionHeader("II. BLUEPRINT & GARMENT DESIGN", y);
    
    drawRowValue("Classification:", order.category.toUpperCase(), 17, 45, y);
    drawRowValue("Template Cut:", order.templateTitle || "Bespoke Cut Outline", 110, 138, y);
    
    y += 7;
    drawRowValue("Fabric Dye/Color:", order.customizations.color || "None Specified", 17, 45, y);
    drawRowValue("Fabric Material:", order.customizations.fabricName || "Aesthetic Dye Selection only", 110, 138, y);

    y += 7;
    drawRowValue("Collar Style:", order.customizations.collarStyle || "N/A", 17, 45, y);
    drawRowValue("Sleeve Layout:", order.customizations.sleeveStyle || "N/A", 110, 138, y);

    if (order.customizations.embroidery) {
      y += 8;
      doc.setFillColor(colLightBg[0], colLightBg[1], colLightBg[2]);
      doc.rect(15, y - 4, 180, 8, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(colPrimary[0], colPrimary[1], colPrimary[2]);
      doc.text("EMBROIDERY MONOGRAM:", 20, y + 1.5);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`"${order.customizations.embroidery}"`, 65, y + 1.5);
    }
    
    if (order.customizations.notes) {
      y += 10;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(110, 120, 130);
      doc.text("CRAFTING INSTRUCTIONS & DESIGNER NOTES:", 17, y);
      y += 4.5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      const splitNotes = doc.splitTextToSize(order.customizations.notes, 176);
      doc.text(splitNotes, 17, y);
      y += splitNotes.length * 4;
    }

    y += 12;

    // 4. BESPOKE SARTORIAL MEASUREMENTS
    y = drawSectionHeader("III. SARTORIAL MEASUREMENTS", y);
    
    // Grid of measurements box
    doc.setFillColor(colLightBg[0], colLightBg[1], colLightBg[2]);
    doc.rect(15, y - 2, 180, 24, "F");
    
    // Draw cells
    const cellWidth = 33;
    const xPositions = [20, 56, 92, 128, 164];
    
    const drawMeasurementBox = (title: string, value: string, x: number) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 140);
      doc.text(title.toUpperCase(), x, y + 4);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(colPrimary[0], colPrimary[1], colPrimary[2]);
      doc.text(value, x, y + 12);
    };

    drawMeasurementBox("Height (cm)", `${order.measurements.height} cm`, xPositions[0]);
    drawMeasurementBox("Chest (cm)", order.measurements.chest ? `${order.measurements.chest} cm` : "Standard", xPositions[1]);
    drawMeasurementBox("Waist (cm)", order.measurements.waist ? `${order.measurements.waist} cm` : "Standard", xPositions[2]);
    drawMeasurementBox("Shoulder", order.measurements.shoulder ? `${order.measurements.shoulder} cm` : "Standard", xPositions[3]);
    drawMeasurementBox("Size Reference", order.measurements.preferredSize, xPositions[4]);

    y += 32;

    // 5. BILLING & LOGISTIC SUMMARY
    y = drawSectionHeader("IV. LOGISTICS & BILLING ESCROW", y);

    drawRowValue("Payment Type:", order.paymentMethod.replace(/_/g, " "), 17, 45, y);
    drawRowValue("Routing Address:", order.deliveryAddress, 110, 138, y);
    
    y += 7;
    drawRowValue("Courier Service:", order.deliveryPartnerId ? "Karim Hassan (Forge Courier)" : "Cairo Express Route Hub", 17, 45, y);
    drawRowValue("Estimated Completion:", order.estimatedCompletion ? new Date(order.estimatedCompletion).toLocaleDateString() : "Pending workshop queue", 110, 138, y);

    y += 12;

    // Draw total price banner
    doc.setFillColor(colPrimary[0], colPrimary[1], colPrimary[2]);
    doc.rect(15, y, 180, 12, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL ESCROW VALUE REGISTERED:", 20, y + 7.5);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(243, 156, 18); // Gold/Orange accent
    doc.text(`EGP ${order.totalPrice}.00`, 190, y + 7.5, { align: "right" });

    // 6. PRINTER FRIENDLY NOTICE & WATERMARK / SIGNATURE
    y += 24;
    doc.setDrawColor(colBorder[0], colBorder[1], colBorder[2]);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(15, y, 195, y);

    y += 6;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text("Notice: This is an official digital couture commission document registered on the secure Fashion Forge Escrow ledger.", 15, y);
    doc.text("Fibers sourced ethically from Egypt's leading Nile Delta suppliers. To update fits or coordinate collection times, message", 15, y + 3.5);
    doc.text("your dedicated tailor directly in the active atelier messenger feed.", 15, y + 7);

    // Decorative stamps
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text("OFFICIAL BLUEPRINT", 195, y + 7, { align: "right" });

    // Trigger save
    doc.save(`Fashion_Forge_Bespoke_Order_${order.orderNumber}.pdf`);
  };

  const loadEcosystemData = async () => {
    if (!currentUser) return;
    setDataLoading(true);
    try {
      // 1. Fetch Orders with relevant filters depending on active persona
      let userOrders: Order[] = [];
      if (currentUser.role === UserRole.CUSTOMER) {
        userOrders = await api.getOrders({ customerId: currentUser.id });
      } else if (currentUser.role === UserRole.TAILOR) {
        userOrders = await api.getOrders({ tailorId: currentUser.id });
      } else if (currentUser.role === UserRole.DELIVERY) {
        // Delivery partners can see their assignments AND we can also see general Cairo jobs
        userOrders = await api.getOrders();
      } else {
        userOrders = await api.getOrders(); // default
      }
      setOrders(userOrders);

      // Updating selected order view to keep details matching dynamic polling
      if (selectedOrder) {
        const freshSelected = userOrders.find(o => o.id === selectedOrder.id);
        if (freshSelected) setSelectedOrder(freshSelected);
      }

      // 2. Fetch Fabrics
      const rolls = await api.getFabrics();
      setFabrics(rolls);

      // 3. Fetch Marketplace listings
      const mkt = await api.getMarketplace();
      setDesigns(mkt);

      // 4. Fetch notifications for current user
      const listNotif = await api.getNotifications(currentUser.id);
      setNotifications(listNotif);

    } catch (err) {
      console.error("Error fetching sandbox records:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUserChange = (id: string) => {
    setCurrentUserId(id);
    setSelectedOrder(null);
    setChatMessages([]);
    setActiveTab("dashboard");
  };

  // Notification actions
  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await api.markNotificationsAsRead(undefined, currentUser.id);
      setShowNotifDropdown(false);
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  // Chat Actions
  const loadChat = async (ordId: string) => {
    setChatLoading(true);
    try {
      const msgs = await api.getMessages(ordId);
      setChatMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newChatText.trim() || !currentUser) return;

    // Determine receiver
    const receiverId = currentUser.role === UserRole.CUSTOMER 
      ? (selectedOrder.tailorId || "tailor_marco") 
      : selectedOrder.customerId;
    const receiverName = currentUser.role === UserRole.CUSTOMER 
      ? (selectedOrder.tailorName || "Marco Rossi") 
      : selectedOrder.customerName;

    try {
      await api.sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId,
        receiverName,
        orderId: selectedOrder.id,
        content: newChatText.trim()
      });
      setNewChatText("");
      loadChat(selectedOrder.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Tailor actions
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrder(orderId, { status });
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetEstimatedDate = async (orderId: string, dateStr: string) => {
    try {
      await api.updateOrder(orderId, { estimatedCompletion: dateStr });
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  // Supplier inventory actions
  const handleAddFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !fabName) return;

    try {
      await api.createFabric({
        supplierId: currentUser.id,
        supplierName: currentUser.name,
        name: fabName,
        category: fabCat,
        color: fabColor,
        colorHex: fabHex,
        pricePerMeter: Number(fabPrice),
        stock: Number(fabStock),
        description: fabDesc,
        fiberComposition: fabComp
      });
      // Reset
      setShowAddFabricForm(false);
      setFabName("");
      setFabDesc("");
      setFabComp("");
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFabricStock = async (fabId: string, amount: number) => {
    const fObj = fabrics.find(f => f.id === fabId);
    if (!fObj) return;
    try {
      await api.updateFabric(fabId, { stock: Math.max(0, fObj.stock + amount) });
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFabric = async (fabId: string) => {
    try {
      await api.deleteFabric(fabId);
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delivery Partner Actions
  const handleAcceptDeliveryPickup = async (orderId: string) => {
    if (!currentUser) return;
    try {
      // Assign the Karim courier ID to this order, and push status to OUT_FOR_DELIVERY
      await api.updateOrder(orderId, { 
        deliveryPartnerId: currentUser.id,
        status: "OUT_FOR_DELIVERY"
      });
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      await api.updateOrder(orderId, { 
        status: "DELIVERED",
        paymentStatus: "PAID" // resolve COD or credit payouts
      });
      loadEcosystemData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-6 bg-slate-50 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Bootstrapping Fashion Forge database pipelines...</p>
      </div>
    );
  }

  // Sidebar link structures based on active user role
  const clientViews = [
    { id: "dashboard", label: "My Custom Orders", icon: ShoppingBag, desc: "Order statuses & messages" },
    { id: "wizard", label: "Atelier Wizard", icon: Scissors, desc: "Step-by-step custom styling" },
    { id: "ai", label: "AI Creative Studio", icon: Sparkles, desc: "Generative dress blueprints" },
    { id: "tryon", label: "Virtual AR Fit Suit", icon: Ruler, desc: "Playground try-on avatar" },
    { id: "marketplace", label: "Atelier Marketplace", icon: Tag, desc: "Freelance designers & shops" },
    { id: "map", label: "Interactive Cairo Map", icon: MapPin, desc: "Explore local sewing points" }
  ];

  const tailorViews = [
    { id: "dashboard", label: "Tailorship Dashboard", icon: Scissors, desc: "Orders qeueue & timelines" },
    { id: "map", label: "Supply Chain Map", icon: MapPin, desc: "Explore local Egyptian sources" }
  ];

  const supplierViews = [
    { id: "dashboard", label: "Material Stockroom", icon: Layers, desc: "Fabric rolls & stock counts" },
    { id: "map", label: "Supply Logistics Map", icon: MapPin, desc: "Active Cairo ateliers" }
  ];

  const deliveryViews = [
    { id: "dashboard", label: "Fleet Dispatch Hub", icon: Truck, desc: "Courier routes & Cairo jobs" },
    { id: "map", label: "Supply Chain Map", icon: MapPin, desc: "Local dropoff locations" }
  ];

  const currentTabSet = 
    currentUser.role === UserRole.CUSTOMER ? clientViews :
    currentUser.role === UserRole.TAILOR ? tailorViews :
    currentUser.role === UserRole.SUPPLIER ? supplierViews : deliveryViews;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="w-[1024px] h-[768px] bg-[#F5F7FA] text-slate-900 font-sans flex flex-col overflow-hidden mx-auto border border-slate-300 shadow-2xl rounded-xl relative" id="applet-viewport-frame">
      
      {/* 1. Environment Role Switcher Toggle */}
      <RoleSwitcher currentUserId={currentUserId} onUserChange={handleUserChange} />

      {/* 2. Primary Navigation Bar */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow font-display">
            FF
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[#2C3E50] tracking-tight text-sm font-display">FASHION FORGE</span>
            <span className="text-[9px] text-[#E67E22] font-semibold uppercase tracking-wider">Atelier Network Egypt</span>
          </div>
        </div>

        {/* User Badge / Notification bell details */}
        <div className="flex items-center gap-4 relative">
          
          {/* Notification bell UI */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (unreadCount > 0) handleMarkNotificationsRead();
              }}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-all cursor-pointer relative"
              id="notification-bell-btn"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white font-bold text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-55 divide-y divide-slate-100 animate-fade-in" id="notifications-list-balloon">
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs">
                  <span className="font-bold">Ecosystem Notifications</span>
                  <button onClick={handleMarkNotificationsRead} className="text-indigo-300 hover:text-white text-[10px] font-semibold cursor-pointer">
                    Dismiss all
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs flex flex-col gap-1 transition-colors ${n.isRead ? "bg-white" : "bg-indigo-50/40"}`}>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800">{n.title}</span>
                          <span className="text-[8px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-sans">{n.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No recent alerts. Platform is tranquil.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-150">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
              <span className="text-[9px] font-bold text-[#3498DB] uppercase">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Primary Application Split View */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Drawer Workspace Sidebar */}
        <aside className="w-60 border-r border-slate-200 bg-white p-4 flex flex-col shrink-0 justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-3.5 pl-2 leading-none">WORKSPACES</h3>
              <ul className="space-y-1" id="sidebar-tab-selection">
                {currentTabSet.map((link) => {
                  const Icon = link.icon;
                  const isSelected = activeTab === link.id && !selectedOrder;
                  return (
                    <li 
                      key={link.id}
                      onClick={() => {
                        setSelectedOrder(null);
                        setActiveTab(link.id);
                      }}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-indigo-50 text-indigo-705 text-indigo-700 font-bold border-l-4 border-indigo-600" 
                          : "text-[#34495E]/80 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      id={`sidebar-${link.id}-link`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div>{link.label}</div>
                        <p className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">{link.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-4" id="sidebar-footer-profile-box">
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 border border-slate-150/40">
              <p className="font-bold text-[#2C3E50] mb-1">Ecosystem Status</p>
              <p className="text-[10px] font-mono">Cairo Latency: 42ms</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                <div className="bg-emerald-500 h-full w-[100%] rounded-full"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          
          {selectedOrder ? (
            /* ============================================================== 
               Order Detail View (Shared, featuring Messages & timelines)
               ============================================================== */
            <div className="space-y-6 animate-fade-in" id="order-detailed-timeline-suite">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <button 
                    onClick={() => {
                      setSelectedOrder(null);
                      loadEcosystemData();
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer mb-1"
                  >
                    ← Return to Workspace List
                  </button>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight font-display">
                    Garment Code: {selectedOrder.orderNumber}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Fabrication State</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    selectedOrder.status === "PENDING" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                    selectedOrder.status === "IN_PROGRESS" ? "bg-blue-105 bg-indigo-50 text-indigo-700 border border-indigo-200" :
                    selectedOrder.status === "READY_FOR_DELIVERY" ? "bg-teal-100 text-teal-800 border border-teal-200" :
                    selectedOrder.status === "OUT_FOR_DELIVERY" ? "bg-purple-100 text-purple-850 border border-purple-200" :
                    "bg-emerald-100 text-emerald-805"
                  }`}>
                    {selectedOrder.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Customizations & measurements card */}
                <div className="md:col-span-7 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-display">Sartorial Specifications</h4>
                      <button 
                        onClick={() => downloadOrderSummary(selectedOrder)}
                        className="flex items-center gap-1 py-1 px-2 text-[10px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg cursor-pointer transition-all shadow-sm"
                        id="download-order-summary-btn"
                        title="Download simplified, printer-friendly PDF order blueprint"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download Summary PDF</span>
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">EGP {selectedOrder.totalPrice}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Client Silhouette</span>
                      <p className="text-slate-800 font-bold capitalize">{selectedOrder.category}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Aesthetic Shade</span>
                      <p className="text-slate-800 font-medium">{selectedOrder.customizations.color}</p>
                    </div>
                    {selectedOrder.customizations.collarStyle && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Collar style</span>
                        <p className="text-slate-800 font-medium">{selectedOrder.customizations.collarStyle}</p>
                      </div>
                    )}
                    {selectedOrder.customizations.sleeveStyle && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Sleeve build</span>
                        <p className="text-slate-800 font-medium">{selectedOrder.customizations.sleeveStyle}</p>
                      </div>
                    )}
                    {selectedOrder.customizations.embroidery && (
                      <div className="col-span-2 bg-indigo-50/45 p-2 rounded border border-indigo-200/50">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-0.5">Stitched Monogram embroidery</span>
                        <p className="text-indigo-900 font-semibold italic">"{selectedOrder.customizations.embroidery}"</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 space-y-2.5 text-xs">
                    <div className="font-bold text-[#2C3E50]">Fitted Dimensions</div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[8px] text-slate-405 text-slate-400 block uppercase">Height</span>
                        <span className="font-mono font-bold text-slate-850">{selectedOrder.measurements.height}cm</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[8px] text-slate-405 text-slate-400 block uppercase">Chest</span>
                        <span className="font-mono font-bold text-slate-850">{selectedOrder.measurements.chest || "Standard"}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[8px] text-slate-405 text-slate-400 block uppercase">Waist</span>
                        <span className="font-mono font-bold text-slate-850">{selectedOrder.measurements.waist || "Standard"}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[8px] text-slate-405 text-slate-400 block uppercase">Base Size</span>
                        <span className="font-mono font-bold text-indigo-650 font-semibold">{selectedOrder.measurements.preferredSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tailor interactive tools if logged in as Marco */}
                  {currentUser.role === UserRole.TAILOR && (
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                      <span className="text-[10px] font-bold text-slate-450 uppercase block">Atelier Workshop Controls</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrder.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, "IN_PROGRESS")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer shadow-sm transition-colors"
                          >
                            Accept & Begin Fabrication
                          </button>
                        )}
                        {selectedOrder.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, "READY_FOR_DELIVERY")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer shadow-sm transition-colors"
                          >
                            Mark Sewing Complete (Ready Courier Dispatch)
                          </button>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Estimated Completion Date</label>
                        <input 
                          type="date"
                          value={selectedOrder.estimatedCompletion ? selectedOrder.estimatedCompletion.substring(0, 10) : ""}
                          onChange={(e) => handleSetEstimatedDate(selectedOrder.id, e.target.value)}
                          className="bg-white border select-none border-slate-350 border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Route progress */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Transit & Logistics Timeline</span>
                    <div className="p-3.5 bg-slate-50/60 rounded-xl space-y-2 border border-slate-200/50">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Courier assigned:</span>
                        <span className="font-bold text-slate-700">{selectedOrder.deliveryPartnerId ? "Karim Hassan (Forge Dispatch)" : "Pending pickup assignment"}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 border-t border-slate-100/50 pt-2">
                        <span>Delivery Address:</span>
                        <span className="font-medium text-slate-700">{selectedOrder.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Live Messenger Box inside Detail view */}
                <div className="md:col-span-5 bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between h-[420px] shadow-sm">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-display flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#3498DB]" />
                      <span>Atelier Fit Messenger</span>
                    </h4>
                  </div>

                  <div className="flex-1 overflow-y-auto py-3 space-y-2" id="detail-messages-history-deck">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((msg) => {
                        const isSelf = msg.senderId === currentUser.id;
                        return (
                          <div key={msg.id} className={`flex flex-col max-w-[85%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start font-sans"}`}>
                            <span className="text-[9px] text-slate-400 mb-0.5">{msg.senderName}</span>
                            <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                              isSelf ? "bg-slate-900 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-10">
                        No messages. Ask your tailor about specific seam fits or fabric changes directly.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="border-t border-slate-150 pt-3 flex gap-2">
                    <input 
                      type="text"
                      required
                      value={newChatText}
                      onChange={(e) => setNewChatText(e.target.value)}
                      placeholder="Type fit adjustments..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button 
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 rounded-lg text-xs cursor-pointer shadow transition-all shrink-0"
                    >
                      Send
                    </button>
                  </form>
                </div>

              </div>
            </div>
          ) : (
            /* ==============================================================
               Regular Screen Routing Toggles
               ============================================================== */
            <div id="active-tabroom-deck">
              
              {activeTab === "dashboard" && (
                <div className="space-y-6" id="role-conditioned-dashboard">
                  
                  {/* Headline summary titles depending on acting role */}
                  <header>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
                      {currentUser.role === UserRole.CUSTOMER ? "My Bespoke Outfits Portfolio" :
                       currentUser.role === UserRole.TAILOR ? "Atelier Workshop Commissions" :
                       currentUser.role === UserRole.SUPPLIER ? "Supplier Fabrics Stock" : "Fleet courier jobs"}
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {currentUser.role === UserRole.CUSTOMER ? "Review active tailorings, chat, and trigger delivery dispatches directly." :
                       currentUser.role === UserRole.TAILOR ? "Manage pending cutting layouts, adjust estimates, and communicate with clients." :
                       currentUser.role === UserRole.SUPPLIER ? "Refine luxury linen fabric rolls, adjust meter rates, and fulfill orders." : 
                       "Acquire pending Cairo pickups, view dropoff locations, and report hanger deliveries."}
                    </p>
                  </header>

                  {/* CUSTOMER PORTAL MAIN DASHBOARD */}
                  {currentUser.role === UserRole.CUSTOMER && (
                    <div className="space-y-6" id="cust-portfolio-box">
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="customer-orders-table-card">
                        <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-display">Commission History</h3>
                          <span className="text-[10px] uppercase font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-semibold font-mono">
                            {orders.length} Active Fitting blueprints
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left" id="cust-orders-layout-table">
                            <thead className="bg-[#f8fafc] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              <tr className="border-b border-slate-200">
                                <th className="px-5 py-3">Reference</th>
                                <th className="px-5 py-3">Silhouette Class</th>
                                <th className="px-5 py-3">Tailor Atelier</th>
                                <th className="px-5 py-3 text-center">Status</th>
                                <th className="px-5 py-3 text-right">Fee (EGP)</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-slate-100">
                              {orders.map((ord) => (
                                <tr 
                                  key={ord.id}
                                  onClick={() => {
                                    setSelectedOrder(ord);
                                    loadChat(ord.id);
                                  }}
                                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <td className="px-5 py-4 font-mono font-bold text-slate-700">{ord.orderNumber}</td>
                                  <td className="px-5 py-4 font-semibold text-slate-850 capitalize">{ord.category} • {ord.templateTitle || "Bespoke Fit"}</td>
                                  <td className="px-5 py-4 text-slate-550">{ord.tailorName || "Marco Rossi"}</td>
                                  <td className="px-5 py-3 text-center">
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                      ord.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                                      ord.status === "IN_PROGRESS" ? "bg-indigo-50 text-indigo-700" :
                                      ord.status === "READY_FOR_DELIVERY" ? "bg-teal-100 text-teal-800" :
                                      ord.status === "OUT_FOR_DELIVERY" ? "bg-purple-100 text-purple-800" :
                                      "bg-emerald-100 text-emerald-800"
                                    }`}>
                                      {ord.status.replace(/_/g, " ")}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right font-bold text-slate-800 font-display">EGP {ord.totalPrice}</td>
                                </tr>
                              ))}
                              {orders.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-medium">
                                    Your portfolio is clear. Head into the Atelier Wizard or AI studio to commission custom clothing styles.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAILOR ATELIER WORKSHOP MAIN DASHBOARD */}
                  {currentUser.role === UserRole.TAILOR && (
                    <div className="space-y-6" id="tailor-ateliers-box">
                      {/* Workshop statistics cards */}
                      <div className="grid grid-cols-4 gap-4" id="tailor-stats-grid">
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left">
                          <span className="text-[9px] font-bold text-slate-450 uppercase block">Inbox Orders</span>
                          <span className="text-xl font-extrabold text-slate-800 font-display mt-1 block">
                            {orders.filter(o => o.status === "PENDING").length}
                          </span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left">
                          <span className="text-[9px] font-bold text-indigo-705 text-indigo-500 uppercase block">Currently Sewing</span>
                          <span className="text-xl font-extrabold text-[#2C3E50] font-display mt-1 block">
                            {orders.filter(o => o.status === "IN_PROGRESS").length}
                          </span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left">
                          <span className="text-[9px] font-bold text-slate-450 uppercase block">Completed Ateliers</span>
                          <span className="text-xl font-extrabold text-slate-800 font-display mt-1 block">
                            {orders.filter(o => o.status === "DELIVERED").length}
                          </span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left font-display">
                          <span className="text-[9px] font-bold text-teal-650 text-teal-650 text-emerald-600 uppercase block font-sans">Collected Revenue</span>
                          <span className="text-base font-extrabold text-slate-800 mt-1.5 block">
                            EGP {orders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + o.totalPrice, 0)}
                          </span>
                        </div>
                      </div>

                      {/* Orders table */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center">
                          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-display">Active Fabrication Queues</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              <tr className="border-b border-slate-200">
                                <th className="px-5 py-3">Reference</th>
                                <th className="px-5 py-3">Client</th>
                                <th className="px-5 py-3">Silhouette specifications</th>
                                <th className="px-5 py-3 text-center">Active state</th>
                                <th className="px-5 py-3 text-right">Fee (EGP)</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-slate-100">
                              {orders.map((ord) => (
                                <tr 
                                  key={ord.id}
                                  onClick={() => {
                                    setSelectedOrder(ord);
                                    loadChat(ord.id);
                                  }}
                                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <td className="px-5 py-4 font-mono font-bold text-slate-700">{ord.orderNumber}</td>
                                  <td className="px-5 py-4 font-semibold text-slate-850">{ord.customerName}</td>
                                  <td className="px-5 py-4 text-slate-550 capitalize">{ord.category} • {ord.templateTitle || "Bespoke Cut"}</td>
                                  <td className="px-5 py-3 text-center">
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                      ord.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                                      ord.status === "IN_PROGRESS" ? "bg-indigo-50 text-indigo-700" :
                                      ord.status === "READY_FOR_DELIVERY" ? "bg-teal-100 text-teal-800" :
                                      ord.status === "OUT_FOR_DELIVERY" ? "bg-purple-100 text-purple-800" :
                                      "bg-emerald-100 text-emerald-850"
                                    }`}>
                                      {ord.status.replace(/_/g, " ")}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right font-bold text-slate-800 font-display">EGP {ord.totalPrice}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUPPLIER MAIN FABRICS INVENTORY DASHBOARD */}
                  {currentUser.role === UserRole.SUPPLIER && (
                    <div className="space-y-6" id="supplier-materials-box">
                      
                      {/* Inventory stats header */}
                      <div className="flex justify-between items-center bg-white p-4.5 rounded-xl border border-slate-200">
                        <div className="text-xs text-slate-500">
                          Total Luxury Fabric Rolls registered: <span className="font-extrabold text-slate-800">{fabrics.length} styles</span>
                        </div>
                        <button
                          onClick={() => setShowAddFabricForm(!showAddFabricForm)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-4.5 rounded-lg text-xs cursor-pointer shadow-sm transition-colors"
                        >
                          {showAddFabricForm ? "Close Constructor" : "+ Register New Fabric Roll"}
                        </button>
                      </div>

                      {showAddFabricForm && (
                        <form onSubmit={handleAddFabric} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in" id="add-fabric-form">
                          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider font-display">Register Raw Fabric Lot</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Fabric Name</label>
                              <input 
                                type="text"
                                required
                                value={fabName}
                                onChange={(e) => setFabName(e.target.value)}
                                placeholder="Giza 92 cotton roll"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Category Classification</label>
                              <select 
                                value={fabCat}
                                onChange={(e) => setFabCat(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              >
                                <option>Cotton</option>
                                <option>Linen</option>
                                <option>Wool</option>
                                <option>Silk</option>
                                <option>Denim</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Color Name</label>
                              <input 
                                type="text"
                                value={fabColor}
                                onChange={(e) => setFabColor(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Color Hex</label>
                              <input 
                                type="text"
                                value={fabHex}
                                onChange={(e) => setFabHex(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Price per Meter (EGP)</label>
                              <input 
                                type="number"
                                value={fabPrice}
                                onChange={(e) => setFabPrice(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Stock Roll (Meters)</label>
                              <input 
                                type="number"
                                value={fabStock}
                                onChange={(e) => setFabStock(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-505"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Fiber Composition</label>
                              <input 
                                type="text"
                                value={fabComp}
                                onChange={(e) => setFabComp(e.target.value)}
                                placeholder="e.g. 100% Giza Egyptian Cotton, or 85% Merino Wool / 15% Silk"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-505"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Fibers description</label>
                              <textarea 
                                rows={2}
                                value={fabDesc}
                                onChange={(e) => setFabDesc(e.target.value)}
                                placeholder="Details about origin, stitch weights..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-505 focus:outline-none"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-lg text-xs cursor-pointer shadow transition-all"
                          >
                            Save Roll Layout Reference
                          </button>
                        </form>
                      )}

                      {/* Fabrics stock breakdown grid */}
                      <div className="grid grid-cols-2 gap-4" id="fabrics-stock-grid-supplier">
                        {fabrics.map((fab) => (
                          <div 
                            key={fab.id} 
                            onClick={() => setSelectedFabric(fab)}
                            className="group bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-xl p-4.5 shadow-sm flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">{fab.category}</span>
                                  <h4 className="font-bold text-slate-800 text-xs font-display mt-2 group-hover:text-indigo-600 transition-colors">{fab.name}</h4>
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setSelectedFabric(fab)}
                                    className="p-1 px-1.5 text-[9px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded transition flex items-center gap-1"
                                    title="View composition & details"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Specs</span>
                                  </button>
                                  <div className="w-7 h-7 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: fab.colorHex }} title={`Hex: ${fab.colorHex}`}></div>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-2.5 line-clamp-2">{fab.description}</p>
                              
                              <p className="text-[10px] text-slate-400 italic mt-1.5 flex items-center gap-1">
                                <span className="font-bold text-slate-500 font-mono">Fiber Composition:</span> 
                                <span className="text-slate-600 truncate max-w-[200px]">{getFabricComposition(fab)}</span>
                              </p>
                            </div>

                            <div>
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block">Rate Per Meter</span>
                                  <span className="font-bold text-slate-800">EGP {fab.pricePerMeter}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 font-bold block">In-Stock</span>
                                  <span className="font-extrabold text-indigo-700">{fab.stock} meters</span>
                                </div>
                              </div>

                              {/* Inventory adjust actions */}
                              <div 
                                className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center gap-1.5 text-xs mt-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[9px] font-bold text-slate-550 shrink-0">Adjust:</span>
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => handleUpdateFabricStock(fab.id, -10)}
                                    className="w-7 h-7 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-bold flex items-center justify-center cursor-pointer transition"
                                  >
                                    -10m
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateFabricStock(fab.id, 10)}
                                    className="w-7 h-7 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-bold flex items-center justify-center cursor-pointer transition"
                                  >
                                    +10m
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleDeleteFabric(fab.id)}
                                  className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-auto transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* COURIER DELIVERY FLEET MAIN DASHBOARD */}
                  {currentUser.role === UserRole.DELIVERY && (
                    <div className="space-y-6" id="delivery-fleet-box">
                      
                      {/* Courier Assignments Lists in tab format */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="delivery-jobs-split-cards">
                        
                        {/* Tab 1: Orders Karim is already Courier of */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                          <div className="px-5 py-3 border-b border-slate-150 bg-slate-50/60 font-bold text-slate-800 text-xs uppercase tracking-wider font-display">
                            My Assigned Dispatches
                          </div>
                          <div className="p-4 flex-1 space-y-4">
                            {orders.filter(o => o.deliveryPartnerId === currentUser.id).length > 0 ? (
                              orders.filter(o => o.deliveryPartnerId === currentUser.id).map(ord => (
                                <div key={ord.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 shadow-inner space-y-3">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800 font-mono">{ord.orderNumber}</span>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                      ord.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                                    }`}>
                                      {ord.status.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-sans space-y-1">
                                    <p><span className="font-bold">Dropoff Maadi:</span> {ord.deliveryAddress}</p>
                                    <p><span className="font-bold">Client:</span> {ord.customerName} ({ord.category})</p>
                                    <p className="font-bold text-[#E67E22]">{ord.paymentMethod === "CASH_ON_DELIVERY" ? "COD: EGP " + ord.totalPrice : "Prepaid Card"}</p>
                                  </div>

                                  {ord.status === "OUT_FOR_DELIVERY" && (
                                    <button
                                      onClick={() => handleMarkAsDelivered(ord.id)}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer shadow transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Mark Hanger-Delivered (Paid Out)
                                    </button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-slate-400 text-xs py-10 font-medium">
                                Navigate right and grab pending Cairo pickups.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tab 2: Available pickups (ready orders) */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                          <div className="px-5 py-3 border-b border-slate-150 bg-slate-50/60 font-bold text-slate-800 text-xs uppercase tracking-wider font-display">
                            Pending Cairo pickups
                          </div>
                          <div className="p-4 flex-1 space-y-4">
                            {orders.filter(o => o.status === "READY_FOR_DELIVERY").length > 0 ? (
                              orders.filter(o => o.status === "READY_FOR_DELIVERY").map(ord => (
                                <div key={ord.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 shadow-inner space-y-3">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-indigo-700 font-mono">{ord.orderNumber}</span>
                                    <span className="text-[9px] font-extrabold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                                      {ord.status.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-sans space-y-1">
                                    <p><span className="font-bold">Manufactured at:</span> {ord.tailorName || "Marco Rossi"}</p>
                                    <p><span className="font-bold">Destination:</span> {ord.deliveryAddress}</p>
                                    <p className="font-bold text-slate-700">Earnings Pot: EGP {ord.totalPrice}</p>
                                  </div>

                                  <button
                                    onClick={() => handleAcceptDeliveryPickup(ord.id)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer shadow transition-colors"
                                  >
                                    Accept Assignment & Load Route
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-slate-400 text-xs py-10 font-medium font-sans">
                                Ateliers are currently sewing active orders. Check back when clothes are complete.
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* Atelier sewing wizard */}
              {activeTab === "wizard" && currentUser.role === UserRole.CUSTOMER && (
                <OrderWizard 
                  customerId={currentUser.id} 
                  customerName={currentUser.name} 
                  fabrics={fabrics} 
                  onOrderCreated={loadEcosystemData} 
                />
              )}

              {/* Gemini studio creative designs */}
              {activeTab === "ai" && currentUser.role === UserRole.CUSTOMER && (
                <AIDesignStudio 
                  customerId={currentUser.id} 
                  customerName={currentUser.name} 
                  onOrderCreated={loadEcosystemData} 
                />
              )}

              {/* Mannequin overlay playground try-on */}
              {activeTab === "tryon" && currentUser.role === UserRole.CUSTOMER && (
                <VirtualTryOn />
              )}

              {/* Designers template listings with card escrows */}
              {activeTab === "marketplace" && (
                <Marketplace 
                  currentUserId={currentUser.id} 
                  currentUserName={currentUser.name} 
                  designs={designs} 
                  onPurchaseSuccess={loadEcosystemData} 
                  onRefresh={loadEcosystemData} 
                />
              )}

              {/* Leaflet/SVG Location Ateliers and Deliveries map */}
              {activeTab === "map" && (
                <CairoMap />
              )}

            </div>
          )}

        </main>
      </div>

      {/* 4. Footer System Bar */}
      <footer className="h-8 bg-slate-900 text-slate-400 text-[10px] flex items-center justify-between px-4 shrink-0 font-mono select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>System Operational</span>
          </div>
          <span>|</span>
          <span>Engine: v3.5 Stable</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Active Session: postmanmhg</span>
          <span className="text-slate-200 uppercase font-bold tracking-widest hover:text-white cursor-pointer">
            Atelier Universe Egypt
          </span>
        </div>
      </footer>

      {/* FABRIC SPECIFICATIONS & FIBER COMPOSITION DETAIL MODAL */}
      {selectedFabric && (() => {
        const liveFabric = fabrics.find(f => f.id === selectedFabric.id) || selectedFabric;
        return (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedFabric(null)}
            id="fabric-details-modal-overlay"
          >
            <div 
              className="bg-white rounded-2xl border border-slate-105 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-8 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
              id="fabric-details-modal"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-150 px-2.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider font-mono">Lot Specifications</span>
                  <span className="text-xs font-mono font-bold text-slate-400">LOT-{liveFabric.id.toUpperCase()}</span>
                </div>
                <button 
                  onClick={() => setSelectedFabric(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors animate-pulse"
                  id="close-fabric-modal-icon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Swatch & Identity Panel */}
              <div className="grid grid-cols-3 gap-6 p-6 border-b border-slate-100">
                {/* Large Color Swatch */}
                <div className="col-span-1 flex flex-col items-center space-y-2.5">
                  <div 
                    className="w-24 h-24 rounded-2xl border border-slate-200 shadow-inner transform hover:scale-105 transition-transform duration-300"
                    style={{ 
                      backgroundColor: liveFabric.colorHex, 
                      boxShadow: "inset 0 4px 8px rgba(0,0,0,0.1), 0 8px 16px -4px rgba(0,0,0,0.08)" 
                    }}
                    title={`Fabric hex swatch: ${liveFabric.colorHex}`}
                  ></div>
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded select-all uppercase">
                    {liveFabric.colorHex}
                  </span>
                </div>
                
                {/* Metadata Column */}
                <div className="col-span-2 space-y-3 flex flex-col justify-center">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-display leading-tight">{liveFabric.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Sourced by {liveFabric.supplierName || "Priya Nair"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Color Category</span>
                      <span className="text-xs font-bold text-slate-700">{liveFabric.color || "Bespoke Dye"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Base Weave</span>
                      <span className="text-xs font-bold text-slate-700 capitalize">{liveFabric.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Area */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                {/* Fiber Composition Details */}
                <div className="bg-gradient-to-tr from-teal-50/40 via-indigo-50/20 to-slate-50 p-4.5 rounded-xl border border-slate-150 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-600" />
                    <h5 className="font-bold text-[10px] uppercase tracking-wider font-display text-slate-700">Fiber Composition Details</h5>
                  </div>
                  <p className="text-xs font-extrabold text-teal-900 font-sans tracking-wide">
                    {getFabricComposition(liveFabric)}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    Ensuring bespoke garment integrity. Sourced ethically under the Fashion Forge Egypt sustainable sourcing ledger.
                  </p>
                </div>

                {/* Atelier Suited Garments list */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Recommended Couture Layouts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getFabricSuitedClothing(liveFabric).map((garment, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-sans flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-550"></span>
                        {garment}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Material description */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Lot description & weaver notes</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    "{liveFabric.description || "No custom lot description registered for this raw roll fiber lot."}"
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl font-mono text-center shadow-inner">
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">UNIT COST</span>
                    <span className="text-xs font-extrabold text-slate-800">EGP {liveFabric.pricePerMeter} / meter</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl font-mono text-center shadow-inner">
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">WAREHOUSE STOCK</span>
                    <span className={`text-xs font-extrabold ${liveFabric.stock < 50 ? 'text-amber-600' : 'text-indigo-700'}`}>
                      {liveFabric.stock} meters active
                    </span>
                  </div>
                </div>

                {/* Quick Stock adjustments */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Stock Adjustments:</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleUpdateFabricStock(liveFabric.id, -20)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer transition shadow-sm active:scale-95"
                    >
                      -20m
                    </button>
                    <button 
                      onClick={() => handleUpdateFabricStock(liveFabric.id, -10)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer transition shadow-sm active:scale-95"
                    >
                      -10m
                    </button>
                    <button 
                      onClick={() => handleUpdateFabricStock(liveFabric.id, 10)}
                      className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer transition shadow-sm active:scale-95"
                    >
                      +10m
                    </button>
                    <button 
                      onClick={() => handleUpdateFabricStock(liveFabric.id, 20)}
                      className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer transition shadow-sm active:scale-95"
                    >
                      +20m
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end">
                <button 
                  onClick={() => setSelectedFabric(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                  id="close-fabric-modal-btn"
                >
                  Close Spec Sheet
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
