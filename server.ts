import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  User, 
  UserRole, 
  Order, 
  Fabric, 
  MarketplaceDesign, 
  Message, 
  AppNotification, 
  ClothingCategory,
  OrderStatus
} from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-Memory Database State (seeded with realistic data representing the ecosystem)
let usersList: User[] = [
  { id: "cust_alex", name: "Alex Rivera", email: "alex@example.com", phone: "+20 100 123 4567", address: "12 Road 9, Maadi, Cairo, Egypt", bio: "Conscious fashion consumer looking for perfect fit bespoke shirts and custom smart-casual attire.", role: UserRole.CUSTOMER },
  { id: "tailor_marco", name: "Marco Rossi (The Tailor Shop)", email: "marco@example.com", phone: "+20 120 789 0123", address: "45 Hassan Sabry St, Zamalek, Cairo, Egypt", bio: "Bespoke tailoring atelier. Specialized in Italian craftsmanship, high-end suits, linen shirts, and embroidery.", role: UserRole.TAILOR },
  { id: "supp_priya", name: "Priya Nair (Global Textiles)", email: "priya@example.com", phone: "+20 110 456 7890", address: "Industrial Zone 3, 6th of October City, Giza, Egypt", bio: "Wholesale importer of luxury fabrics, fine Egyptian Giza cottons, pure linen lengths, and natural threads.", role: UserRole.SUPPLIER },
  { id: "del_karim", name: "Karim Hassan (Forge Dispatch)", email: "karim@example.com", phone: "+20 150 987 6543", address: "88 El Merghany St, Heliopolis, Cairo, Egypt", bio: "Rapid transit and garment logistics specialist. Equipped with professional hanger-racks and protective packing.", role: UserRole.DELIVERY }
];

let fabricsList: Fabric[] = [
  { id: "fab_1", supplierId: "supp_priya", supplierName: "Priya Nair", name: "Premium Egyptian Cotton (Giza 92)", category: "Cotton", color: "Classic Pearl White", colorHex: "#F1EFE0", pricePerMeter: 350, stock: 250, description: "Highly durable, extra-long-staple cotton with a silky feel. Perfect for high-quality dress shirts.", fiberComposition: "100% Giza Egyptian Long-Staple Cotton" },
  { id: "fab_2", supplierId: "supp_priya", supplierName: "Priya Nair", name: "Italian Linen Weave", category: "Linen", color: "Sand Beige", colorHex: "#D2C5B1", pricePerMeter: 480, stock: 120, description: "Lightweight and breathable. Highly suitable for casual summer linen shirts, suits, and pants.", fiberComposition: "100% Belgian Flax Organic Linen" },
  { id: "fab_3", supplierId: "supp_priya", supplierName: "Priya Nair", name: "Wool Blend Gabardine", category: "Wool", color: "Midnight Navy Blue", colorHex: "#1B2A47", pricePerMeter: 750, stock: 85, description: "Smooth finish and elegant drape. Excellent crease recovery, ideal for premium structured jackets & suits.", fiberComposition: "85% Australian Merino Virgin Wool, 15% Mulberry Silk Blend" },
  { id: "fab_4", supplierId: "supp_priya", supplierName: "Priya Nair", name: "Heavyweight Denim Indigo", category: "Denim", color: "Indigo Wash", colorHex: "#2C4A75", pricePerMeter: 240, stock: 180, description: "100% Cotton raw denim. Highly durable, optimal for bespoke jacket utility cuts and heavy trousers.", fiberComposition: "100% Ring-Spun Indigo Cotton Denim" },
  { id: "fab_5", supplierId: "supp_priya", supplierName: "Priya Nair", name: "Organic Cotton Lawn", category: "Cotton", color: "Lilac Mist", colorHex: "#E1D5E7", pricePerMeter: 310, stock: 95, description: "Sheer and light cotton fabric. Perfect for luxury summer abayas, dresses, and breathable inner wear.", fiberComposition: "100% Certified Organic Superfine Cotton Lawn" },
  { id: "fab_6", supplierId: "supp_priya", supplierName: "Priya Nair", name: "Mulberry Silk Lining", category: "Silk", color: "Golden Champagne", colorHex: "#E7CE9F", pricePerMeter: 920, stock: 40, description: "Ultra-premium 100% natural mulberry silk. Provides a smooth, luxurious feeling for blazer linings and premium evening wear.", fiberComposition: "100% Pure Mulberry Hand-spun Silk (19 Momme)" }
];

let ordersList: Order[] = [
  {
    id: "ord_101",
    orderNumber: "FM-2026-001",
    customerId: "cust_alex",
    customerName: "Alex Rivera",
    tailorId: "tailor_marco",
    tailorName: "Marco Rossi (The Tailor Shop)",
    supplierId: "supp_priya",
    deliveryPartnerId: "del_karim",
    category: "shirt",
    templateId: "tpl_smart_shirt",
    templateTitle: "Oxford Dress Shirt",
    customizations: {
      color: "Classic Pearl White",
      fabricId: "fab_1",
      fabricName: "Premium Egyptian Cotton (Giza 92)",
      collarStyle: "Cutaway Collar",
      sleeveStyle: "Double French Cuffs",
      buttonType: "Mother of Pearl",
      pocketStyle: "No Pocket",
      notes: "Please write initials 'AR' in subtle navy embroidery on the left cuff."
    },
    measurements: {
      height: 182,
      chest: 104,
      waist: 88,
      shoulder: 46,
      sleeve: 64,
      preferredSize: "M"
    },
    status: "IN_PROGRESS",
    deliveryAddress: "12 Road 9, Maadi, Cairo, Egypt",
    deliveryNotes: "Deliver after 5 PM, call beforehand.",
    paymentStatus: "PAID",
    paymentMethod: "CREDIT_CARD",
    paymentReference: "CC-APP-92104-EGP",
    totalPrice: 1850,
    estimatedCompletion: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days out
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: "ord_102",
    orderNumber: "FM-2026-002",
    customerId: "cust_alex",
    customerName: "Alex Rivera",
    tailorId: "tailor_marco",
    tailorName: "Marco Rossi (The Tailor Shop)",
    supplierId: "supp_priya",
    category: "pants",
    templateId: "tpl_linen_pants",
    templateTitle: "Bespoke Linen Trousers",
    customizations: {
      color: "Sand Beige",
      fabricId: "fab_2",
      fabricName: "Italian Linen Weave",
      buttonType: "Horn Buttons",
      pocketStyle: "Double Welt Back Pockets",
      notes: "Adjust cuffs at exactly 2 cm. Relaxed waist fit if possible."
    },
    measurements: {
      height: 182,
      waist: 88,
      hips: 102,
      inseam: 81,
      preferredSize: "M"
    },
    status: "PENDING",
    deliveryAddress: "12 Road 9, Maadi, Cairo, Egypt",
    deliveryNotes: "Ring the bell, gate-keeper can receive.",
    paymentStatus: "CASH_ON_DELIVERY",
    paymentMethod: "CASH_ON_DELIVERY",
    totalPrice: 1200,
    createdAt: new Date().toISOString()
  }
];

let marketplaceListings: MarketplaceDesign[] = [
  {
    id: "mkt_1",
    designerId: "tailor_marco",
    designerName: "Marco Rossi",
    title: "The Pharaoh's Legacy Blazer",
    description: "A breathtaking structured blazer crafted with navy wool-gabardine, highlighted by subtle hand-stitched golden embroidery on the lapels depicting heritage wing motifs.",
    category: "jacket",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800",
    isSold: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mkt_2",
    designerId: "supp_priya",
    designerName: "Priya Nair",
    title: "Lilac Desert Oasis Abaya",
    description: "Luxurious double-folded linen-cotton drape dress with flowy cape shoulders. Fits softly across body lines with stunning minimalist drape styling.",
    category: "abaya",
    price: 2400,
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
    isSold: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mkt_3",
    designerId: "tailor_marco",
    designerName: "Marco Rossi",
    title: "Classic Egyptian Cotton Tuxedo Shirt",
    description: "Premium tailored tuxedo dress shirt with pleated bib, hidden button placket, and French cuffs. Perfectly optimized for black tie events.",
    category: "shirt",
    price: 1950,
    imageUrl: "https://images.unsplash.com/photo-1620012253295-c05cc3e65843?auto=format&fit=crop&q=80&w=800",
    isSold: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let messagesList: Message[] = [
  {
    id: "msg_1",
    senderId: "cust_alex",
    senderName: "Alex Rivera",
    receiverId: "tailor_marco",
    receiverName: "Marco Rossi",
    orderId: "ord_101",
    content: "Hi Marco, is there any possibility to refine the sleeve length to exactly 64.5cm? I measured once more and feel safer with that extra half-centimeter.",
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg_2",
    senderId: "tailor_marco",
    senderName: "Marco Rossi",
    receiverId: "cust_alex",
    receiverName: "Alex Rivera",
    orderId: "ord_101",
    content: "Greetings Alex! Absolutely. I have adjusted your profile to reflect 64.5cm for this shirt. Rest assured, the Giza 92 material has arrived from Priya Nair and looks exceptional.",
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

let notificationsList: AppNotification[] = [
  { id: "not_1", userId: "cust_alex", title: "Material Dispatch Received", content: "Priya Nair has supplied the Premium Giza 92 fabric to your tailor Marco Rossi.", linkTo: "/order-tracking/ord_101", isRead: false, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: "not_2", userId: "tailor_marco", title: "New Custom Order", content: "Alex Rivera placed a custom Bespoke Linen Trousers order. Pending acceptance.", linkTo: "/tailor", isRead: false, createdAt: new Date().toISOString() },
  { id: "not_3", userId: "cust_alex", title: "Sleeve Adjustment Approved", content: "Marco Rossi replied to your measurement inquiry with updated instructions.", linkTo: "/order-tracking/ord_101", isRead: false, createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString() }
];

// Lazy-initialize Gemini API safely
let geminiClientCache: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClientCache) return geminiClientCache;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Studio will run in Simulated Generation mode.");
    return null;
  }

  try {
    geminiClientCache = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return geminiClientCache;
  } catch (error) {
    console.error("Failed to initialize Google GenAI SDK:", error);
    return null;
  }
}

// REST API Endpoints

// 1. Users
app.get("/api/users", (req: Request, res: Response) => {
  res.json(usersList);
});

app.get("/api/users/:id", (req: Request, res: Response) => {
  const user = usersList.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.put("/api/users/:id", (req: Request, res: Response) => {
  const index = usersList.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "User not found" });
  usersList[index] = { ...usersList[index], ...req.body };
  res.json(usersList[index]);
});

// 2. Orders
app.get("/api/orders", (req: Request, res: Response) => {
  const { customerId, tailorId, deliveryPartnerId } = req.query;
  let results = [...ordersList];

  if (customerId) {
    results = results.filter(o => o.customerId === customerId);
  }
  if (tailorId) {
    results = results.filter(o => o.tailorId === tailorId);
  }
  if (deliveryPartnerId) {
    results = results.filter(o => o.deliveryPartnerId === deliveryPartnerId);
  }

  res.json(results);
});

app.get("/api/orders/:id", (req: Request, res: Response) => {
  const order = ordersList.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post("/api/orders", (req: Request, res: Response) => {
  const orderData = req.body;
  const newOrder: Order = {
    id: `ord_${Math.floor(100 + Math.random() * 900)}`,
    orderNumber: `FM-2026-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString(),
    status: "PENDING",
    paymentStatus: orderData.paymentMethod === "CREDIT_CARD" ? "PAID" : "CASH_ON_DELIVERY",
    ...orderData
  };

  ordersList.unshift(newOrder);

  // Notify tailor if tailor assigned
  if (newOrder.tailorId) {
    notificationsList.unshift({
      id: `not_${Date.now()}`,
      userId: newOrder.tailorId,
      title: "New Custom Order Assigned",
      content: `${newOrder.customerName} has commissioned a new ${newOrder.category}.`,
      linkTo: "/tailor",
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  res.status(201).json(newOrder);
});

app.patch("/api/orders/:id", (req: Request, res: Response) => {
  const orderId = req.params.id;
  const index = ordersList.findIndex(o => o.id === orderId);
  if (index === -1) return res.status(404).json({ error: "Order not found" });

  const oldOrder = ordersList[index];
  const updatedOrder = { ...oldOrder, ...req.body };
  ordersList[index] = updatedOrder;

  // Generate automated triggers based on state transit
  if (req.body.status && req.body.status !== oldOrder.status) {
    // Notify customer
    notificationsList.unshift({
      id: `not_${Date.now()}`,
      userId: updatedOrder.customerId,
      title: `Order Status: ${req.body.status}`,
      content: `Your tailored ${updatedOrder.category} (${updatedOrder.orderNumber}) is now ${req.body.status.replace(/_/g, " ")}.`,
      linkTo: `/order-tracking/${updatedOrder.id}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json(updatedOrder);
});

// 3. Fabrics
app.get("/api/fabrics", (req: Request, res: Response) => {
  res.json(fabricsList);
});

app.post("/api/fabrics", (req: Request, res: Response) => {
  const newFabric: Fabric = {
    id: `fab_${Math.floor(100 + Math.random() * 900)}`,
    ...req.body
  };
  fabricsList.push(newFabric);
  res.status(201).json(newFabric);
});

app.put("/api/fabrics/:id", (req: Request, res: Response) => {
  const index = fabricsList.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Fabric not found" });
  fabricsList[index] = { ...fabricsList[index], ...req.body };
  res.json(fabricsList[index]);
});

app.delete("/api/fabrics/:id", (req: Request, res: Response) => {
  const index = fabricsList.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Fabric not found" });
  const deleted = fabricsList.splice(index, 1);
  res.json(deleted[0]);
});

// 4. Marketplace
app.get("/api/marketplace", (req: Request, res: Response) => {
  res.json(marketplaceListings);
});

app.post("/api/marketplace", (req: Request, res: Response) => {
  const newListing: MarketplaceDesign = {
    id: `mkt_${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString(),
    isSold: false,
    ...req.body
  };
  marketplaceListings.unshift(newListing);
  res.status(201).json(newListing);
});

app.post("/api/marketplace/purchase", (req: Request, res: Response) => {
  const { designId, buyerId, buyerName, deliveryAddress, paymentMethod } = req.body;
  const designIndex = marketplaceListings.findIndex(d => d.id === designId);
  if (designIndex === -1) return res.status(404).json({ error: "Design listing not found" });
  
  const design = marketplaceListings[designIndex];
  if (design.isSold) return res.status(400).json({ error: "This listing has already been claimed." });

  // Mark as sold
  design.isSold = true;
  design.buyerId = buyerId;

  // Automatically spawn a new Order for this designer/tailor to manufacture this exact item for the buyer!
  // Find designer's user object to see if they can tailor, or default to Marco.
  const tailorUser = usersList.find(u => u.id === design.designerId && u.role === UserRole.TAILOR) || usersList.find(u => u.role === UserRole.TAILOR)!;

  const newOrder: Order = {
    id: `ord_${Math.floor(100 + Math.random() * 900)}`,
    orderNumber: `FM-2026-${Math.floor(100 + Math.random() * 900)}`,
    customerId: buyerId,
    customerName: buyerName,
    tailorId: tailorUser.id,
    tailorName: tailorUser.name,
    category: design.category,
    templateTitle: design.title,
    customizations: {
      color: "Designer's Selected Fabric Palette",
      notes: `Marketplace Purchase of "${design.title}". Please verify buyer's premium fit standard dimensions.`
    },
    measurements: {
      height: 180,
      preferredSize: "M"
    },
    status: "PENDING",
    deliveryAddress: deliveryAddress || "Alexandria, Egypt",
    paymentStatus: paymentMethod === "CREDIT_CARD" ? "PAID" : "CASH_ON_DELIVERY",
    paymentMethod: paymentMethod || "CREDIT_CARD",
    totalPrice: design.price,
    createdAt: new Date().toISOString()
  };

  ordersList.unshift(newOrder);

  // Notify Designer / Tailor
  notificationsList.unshift({
    id: `not_${Date.now()}`,
    userId: tailorUser.id,
    title: "Marketplace Sale!",
    content: `${buyerName} bought your design "${design.title}". Order scheduled for fabrication.`,
    linkTo: "/tailor",
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Notify Buyer
  notificationsList.unshift({
    id: `not_buyer_${Date.now()}`,
    userId: buyerId,
    title: "Marketplace Purchase Confirmed",
    content: `You secured "${design.title}". Standard fabrication & fitting has been scheduled with ${tailorUser.name}.`,
    linkTo: `/order-tracking/${newOrder.id}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, order: newOrder, design });
});

// 5. Messages
app.get("/api/messages/:orderId", (req: Request, res: Response) => {
  const result = messagesList.filter(m => m.orderId === req.params.orderId);
  res.json(result);
});

app.post("/api/messages", (req: Request, res: Response) => {
  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  messagesList.push(newMsg);

  // Spawn matching notification
  notificationsList.unshift({
    id: `not_${Date.now()}`,
    userId: newMsg.receiverId,
    title: `New Message from ${newMsg.senderName}`,
    content: newMsg.content.substring(0, 80) + (newMsg.content.length > 80 ? "..." : ""),
    linkTo: `/chat/${newMsg.orderId}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newMsg);
});

// 6. Notifications
app.get("/api/notifications/:userId", (req: Request, res: Response) => {
  const result = notificationsList.filter(n => n.userId === req.params.userId);
  res.json(result);
});

app.post("/api/notifications/read", (req: Request, res: Response) => {
  const { id, userId } = req.body;
  if (id) {
    const notification = notificationsList.find(n => n.id === id);
    if (notification) notification.isRead = true;
  } else if (userId) {
    notificationsList.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
  }
  res.json({ success: true });
});

// 7. Secure Server-Side Gemini API AI Design Studio Endpoint
app.post("/api/ai/generate", async (req: Request, res: Response) => {
  const { occasion, style, bodyType, fabric, budget, colors } = req.body;

  if (!occasion || !style) {
    return res.status(400).json({ error: "Missing required properties 'occasion' and 'style'." });
  }

  const aiClient = getGeminiClient();

  if (!aiClient) {
    // Fallback: Let's output high-quality simulated designs matching user's filters! 
    // This allows seamless local prototyping when key is missing, without ever breaking user flow.
    const generatedDesign = generateMockBespokeDesign(occasion, style, bodyType, fabric, budget, colors);
    return res.json({
      success: true,
      simulation: true,
      data: generatedDesign
    });
  }

  try {
    const prompt = `Create a bespoke clothing design plan based on these parameters:
    - Occasion/Event: ${occasion}
    - Aesthetic/Style Style: ${style}
    - User Body Type: ${bodyType}
    - Desired Fabric class: ${fabric || "any premium clothing material"}
    - Maximum Price Budget: EGP ${budget || "flexible"}
    - Favorite Accent Colors: ${colors ? colors.join(", ") : "Classic Tones"}

    Provide a JSON-formatted response with the following strictly defined fields:
    - title (a creative, high-fashion, descriptive title like 'Beige Dune Summer Linen Coat')
    - description (a detailed, stunning, high-fashion descriptive overview of this attire, detailing its drape, pocket layouts, seam detailing, aesthetic fit rules, and general allure)
    - colors (array of 3 hex colors that compose this perfect look)
    - fabrics (array of 1 or 2 matching custom fabrics with details, e.g. Egyptian Giza Cotton)
    - estimatedPrice (an exact numeric EGP value suited for custom manual tailoring within the budget)
    - steps (array of 5 detailed sequential steps for the tailor to fabricate this outfit, from canvas cutting to final fits)
    - visualPrompt (a highly detailed text prompt describing a mockup image of this clothing lying nicely on a high-fashion model or elegant mannequin against a warm light Grey backdrop, to guide image generation in future version)
    
    Return ONLY valid, parsable JSON matching this schema description. Prompt should look exceptionally tailored and professional.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            fabrics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            estimatedPrice: { type: Type.NUMBER },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            visualPrompt: { type: Type.STRING }
          },
          required: ["title", "description", "colors", "fabrics", "estimatedPrice", "steps", "visualPrompt"]
        }
      }
    });

    const replyText = response.text ? response.text.trim() : "";
    if (!replyText) {
      throw new Error("Received empty response text from Gemini API.");
    }

    const parsedData = JSON.parse(replyText);
    res.json({
      success: true,
      simulation: false,
      data: parsedData
    });

  } catch (error: any) {
    console.error("Gemini service error. Serving high quality design backup simulation:", error.message || error);
    const backupDesign = generateMockBespokeDesign(occasion, style, bodyType, fabric, budget, colors);
    res.json({
      success: true,
      simulation: true,
      errorMsg: error.message || "Failed to parse Gemini model response, served high fidelity backup.",
      data: backupDesign
    });
  }
});

function generateMockBespokeDesign(occ: string, sty: string, body: string, fab: string, bdg: number, cols: string[]) {
  const chosenColors = cols && cols.length > 0 ? cols : ["#2C3E50", "#E67E22", "#F5F7FA"];
  const colorNames = chosenColors.map(c => `Tone ${c}`);
  
  return {
    title: `The Bespoke ${sty.toUpperCase()} ${occ} Ensemble`,
    description: `A stunningly tailored ${occ} outfit customized for a ${body} stature, blending premium ${fab || "Egyptian cotton threads"} highlights with subtle custom stitchings. It has structured contours, comfortable lining, minimalist single-breasted fits, and precise sleeve fall tailored for supreme elegance.`,
    colors: chosenColors.slice(0, 3),
    fabrics: [fab || "Premium Italian Linen", "Soft Cotton Lining"],
    estimatedPrice: bdg ? Math.min(bdg, 2200) : 1850,
    steps: [
      `Step 1: Drape analysis and custom pattern mapping for ${body} anatomy.`,
      `Step 2: Micro-shearing of ${fab || "Fine Linen"} fibers to length standard.`,
      `Step 3: Internal canvas stabilization for structural durability and shape retention.`,
      `Step 4: Crafting the customizable options including color pairing with ${colorNames.join("/")}.`,
      `Step 5: Hand-finishing the cuffs and final hot-press steam alignment.`
    ],
    visualPrompt: `Elegant studio flat-lay of custom structured ${sty} dress suited for ${occ} under soft amber illumination, luxury fabric shadows.`
  };
}

// Vite Server Setup / Production static serves
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode, mount Vite dev server to handle module resolution, assets, and React HMR under port 3000
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    // In production, serve the compiled static asset assets out of /dist and map all routes to fallback index.html for SPA router
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=========================================`);
    console.log(`Fashion Forge Server is alive and listening!`);
    console.log(`Address: http://0.0.0.0:3000`);
    console.log(`Environment Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`=========================================`);
  });
}

startServer();
