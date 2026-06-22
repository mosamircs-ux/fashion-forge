import React, { useState } from "react";
import { Sparkles, ShoppingBag, Loader2, CreditCard, ChevronRight, CheckCircle, Tag, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { MarketplaceDesign } from "../types";

interface MarketplaceProps {
  currentUserId: string;
  currentUserName: string;
  designs: MarketplaceDesign[];
  onPurchaseSuccess: () => void;
  onRefresh: () => void;
}

export default function Marketplace({ 
  currentUserId, 
  currentUserName, 
  designs, 
  onPurchaseSuccess, 
  onRefresh 
}: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "shirt" | "jacket" | "abaya">("all");
  const [checkoutDesign, setCheckoutDesign] = useState<MarketplaceDesign | null>(null);
  
  // Checkout card state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [addr, setAddr] = useState("12 Road 9, Maadi, Cairo, Egypt");
  const [payMethod, setPayMethod] = useState<"CREDIT_CARD" | "CASH_ON_DELIVERY">("CREDIT_CARD");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successRef, setSuccessRef] = useState("");

  // New Listing state (for tailors/designers)
  const [showListForm, setShowListForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState<"shirt" | "jacket" | "abaya">("shirt");
  const [newPrice, setNewPrice] = useState(1500);
  const [newUrl, setNewUrl] = useState("https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800");

  const categories = [
    { value: "all", label: "All Garments" },
    { value: "shirt", label: "Shirts" },
    { value: "jacket", label: "Blazers" },
    { value: "abaya", label: "Abayas" }
  ] as const;

  const filteredDesigns = selectedCategory === "all" 
    ? designs 
    : designs.filter(d => d.category === selectedCategory);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic auto-masking credit card formatting (xxxx xxxx xxxx xxxx)
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(val);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      setExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
    } else {
      setExpiry(val);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutDesign) return;

    if (payMethod === "CREDIT_CARD") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setErrorMsg("Please enter a valid 16-digit credit card number layout.");
        return;
      }
      if (expiry.length < 5) {
        setErrorMsg("Please provide card expiry details (MM/YY).");
        return;
      }
      if (cvv.length < 3) {
        setErrorMsg("Please provide card CVV verification code.");
        return;
      }
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const resp = await api.purchaseDesign({
        designId: checkoutDesign.id,
        buyerId: currentUserId,
        buyerName: currentUserName,
        deliveryAddress: addr,
        paymentMethod: payMethod
      });

      if (resp.success) {
        setSuccessRef(resp.order.orderNumber);
        onPurchaseSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed processing custom escrow contract. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    setLoading(true);

    try {
      await api.createMarketplaceListing({
        designerId: currentUserId,
        designerName: currentUserName,
        title: newTitle,
        description: newDesc,
        category: newCat as any,
        price: Number(newPrice),
        imageUrl: newUrl
      });
      setShowListForm(false);
      setNewTitle("");
      setNewDesc("");
      onRefresh();
    } catch (err) {
      setErrorMsg("Failed to list design. Verify role state permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="marketplace-ateliers-tab">
      
      {/* Category header & Listing controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-slate-200">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                selectedCategory === cat.value
                  ? "border-slate-800 bg-slate-900 text-white shadow"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tailor / Supplier can list designs */}
        {(currentUserId === "tailor_marco" || currentUserId === "supp_priya") && (
          <button
            onClick={() => setShowListForm(!showListForm)}
            className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs cursor-pointer shadow transition-colors"
          >
            {showListForm ? "Close Constructor Form" : "List New Bespoke Concept"}
          </button>
        )}
      </div>

      {/* List Form */}
      {showListForm && (
        <form onSubmit={handleCreateListing} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-bold text-slate-900 text-sm font-display">Construct Freelance Clothing Design Blueprint</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Concept Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Damascus Linen Summer Gown"
                className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-550 focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Silhouette Price (EGP)</label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-550 focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Classification</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-505 focus:outline-none"
              >
                <option value="shirt">Custom Shirt</option>
                <option value="jacket">Structured Blazer</option>
                <option value="abaya">Egyptian Abaya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mockup Image URL</label>
              <input
                type="text"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-505 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stylist Description</label>
              <textarea
                required
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Outline how the lapel falls, suggested lining and tailored dimensions..."
                className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-505 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white font-bold px-5 py-2 rounded-lg text-xs hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 shadow"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5 text-amber-400" />}
            Publish Concept for Cairo Buyers
          </button>
        </form>
      )}

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="marketplace-grid-layout">
        {filteredDesigns.map((design) => (
          <div 
            key={design.id} 
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all flex flex-col justify-between"
          >
            <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
              <img 
                src={design.imageUrl} 
                alt={design.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              {design.isSold ? (
                <div className="absolute top-2.5 left-2.5 bg-rose-600/90 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest shadow">
                  Sold Out / Fabricating
                </div>
              ) : (
                <div className="absolute top-2.5 left-2.5 bg-emerald-600/90 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest shadow">
                  Claim Silhouette
                </div>
              )}
              <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur text-white text-[10px] font-mono px-2 py-0.5 rounded">
                Category: {design.category}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-xs lines-1 font-display">{design.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Designed by: {design.designerName}</p>
                <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed lines-3 font-sans h-12 overflow-hidden">
                  {design.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Sartorial price</span>
                  <span className="text-sm font-extrabold text-slate-800 font-display">EGP {design.price}</span>
                </div>

                {!design.isSold && (
                  <button
                    onClick={() => {
                      setSuccessRef("");
                      setCheckoutDesign(design);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-[11px] cursor-pointer shadow-sm transition-colors flex items-center gap-1"
                  >
                    <span>Claim Fit</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Dialog Modal */}
      {checkoutDesign && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="checkout-escrow-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm tracking-tight font-display">Secure Custom Checkout Gate</span>
              <button 
                onClick={() => setCheckoutDesign(null)}
                className="text-slate-400 hover:text-white text-xs font-bold font-mono tracking-tight cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6">
              {successRef ? (
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Escrow Securely Registered!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    A tailored fabrication blueprint of <span className="font-bold text-slate-800">"{checkoutDesign.title}"</span> has been dispatched to Marco (Tailor).
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center font-mono text-xs font-bold text-indigo-700">
                    Order Ref: {successRef}
                  </div>
                  <button
                    onClick={() => {
                      setCheckoutDesign(null);
                      onPurchaseSuccess();
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Manage order Tracking timelines
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[9px]">Sought Garment design</span>
                      <span className="font-bold text-slate-800">{checkoutDesign.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block uppercase font-bold text-[9px]">Escrow Total</span>
                      <span className="font-extrabold text-indigo-600">EGP {checkoutDesign.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPayMethod("CREDIT_CARD")}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all ${
                        payMethod === "CREDIT_CARD" 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm" 
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod("CASH_ON_DELIVERY")}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all ${
                        payMethod === "CASH_ON_DELIVERY" 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm" 
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Cash on Delivery
                    </button>
                  </div>

                  {payMethod === "CREDIT_CARD" ? (
                    <div className="space-y-3 p-3 bg-slate-50/50 rounded-lg border border-slate-200/50 animate-fade-in">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Secure Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4123 4567 8901 2345"
                          className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-35 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            required
                            value={expiry}
                            onChange={handleExpiryChange}
                            placeholder="12/28"
                            className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">CVV Code</label>
                          <input
                            type="password"
                            required
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                            placeholder="***"
                            className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-slate-150 text-[11px] text-slate-500 leading-relaxed font-sans">
                      Paying with cash. Escrow parameters are maintained. Cairo dispatchers (Karim Hassan) will collect EGP fees upon hanger-delivery.
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Cairo Routing Address</label>
                    <input
                      type="text"
                      required
                      value={addr}
                      onChange={(e) => setAddr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-505"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-700">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-2.5 rounded-lg text-xs flex justify-center items-center gap-1 shadow cursor-pointer transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 hover:scale-110" />
                        <span>Authorize Bespoke Fabrication Escrow</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
