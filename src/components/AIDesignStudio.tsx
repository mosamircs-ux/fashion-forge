import React, { useState } from "react";
import { Sparkles, Loader2, DollarSign, PenTool, CheckCircle, HelpCircle } from "lucide-react";
import { api } from "../lib/api";
import { AIDesignResult } from "../types";

interface AIDesignStudioProps {
  customerId: string;
  customerName: string;
  onOrderCreated: () => void;
}

export default function AIDesignStudio({ customerId, customerName, onOrderCreated }: AIDesignStudioProps) {
  const [occasion, setOccasion] = useState("Wedding Ceremony");
  const [style, setStyle] = useState("Modern Classic Tuxedo");
  const [bodyType, setBodyType] = useState("Athletic Double-Breasted");
  const [fabric, setFabric] = useState("Egyptian Cotton & Silk Blend");
  const [budget, setBudget] = useState(2500);
  const [selectedColors, setSelectedColors] = useState<string[]>(["#1B2A47", "#D2C5B1", "#E67E22"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIDesignResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const colorOptions = [
    { name: "Navy Blue", hex: "#1B2A47" },
    { name: "Gold Lining", hex: "#E7CE9F" },
    { name: "Rust Orange", hex: "#E67E22" },
    { name: "Off White", hex: "#F1EFE0" },
    { name: "Noir Charcoal", hex: "#2C3E50" },
    { name: "Forest Green", hex: "#2C5D44" },
    { name: "Burgundy Wine", hex: "#5C1D24" }
  ];

  const handleColorToggle = (hex: string) => {
    if (selectedColors.includes(hex)) {
      setSelectedColors(selectedColors.filter(c => c !== hex));
    } else {
      if (selectedColors.length < 3) {
        setSelectedColors([...selectedColors, hex]);
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg("");
    setResult(null);
    setSuccessMsg("");

    try {
      const resp = await api.generateAIDesign({
        occasion,
        style,
        bodyType,
        fabric,
        budget,
        colors: selectedColors
      });

      if (resp.success) {
        setResult(resp.data);
      } else {
        setErrorMsg(resp.errorMsg || "Failed to generate garment guide.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gateway timeout calling Gemini servers.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommission = async () => {
    if (!result) return;
    try {
      const orderData = {
        customerId,
        customerName,
        category: "jacket" as any,
        templateTitle: result.title,
        customizations: {
          color: result.colors.join(", "),
          fabricName: result.fabrics.join(" and "),
          notes: `AI Generated Concept: ${result.description}\n\nTailoring Instructions:\n${result.steps.join("\n")}`
        },
        measurements: {
          height: 180,
          preferredSize: "M" as any
        },
        totalPrice: result.estimatedPrice,
        deliveryAddress: "12 Road 9, Maadi, Cairo, Egypt",
        paymentMethod: "CASH_ON_DELIVERY" as any
      };

      await api.createOrder(orderData);
      setSuccessMsg("🎉 AI custom concept commissioned successfully! Order has been assigned to Marco (Tailor) workshop.");
      onOrderCreated();
    } catch (err: any) {
      setErrorMsg("Failed to place active commission. Ensure network state is active.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="ai-design-studio-block">
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h2 className="font-bold tracking-tight text-base font-display">Fashion Forge AI Studio</h2>
        </div>
        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
          Powered by Gemini 3.5
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Column */}
        <div className="lg:col-span-5 space-y-5" id="ai-controls-panel">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Occasion / Theme</label>
            <select 
              value={occasion} 
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option>Wedding Ceremony</option>
              <option>Cairo Opera Night Gala</option>
              <option>Coastal Summer Retreat</option>
              <option>High-End Corporate Opening</option>
              <option>Traditional Arab Heritage Festival</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Desired Style Style</label>
            <input 
              type="text" 
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Modern Slim Cut Abaya, Egyptian Linen blazer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anatomical Fit</label>
              <select 
                value={bodyType} 
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option>Athletic Waist</option>
                <option>Broad Shoulder Stretch</option>
                <option>Relaxed Fluid Fall</option>
                <option>Slim Structured Petite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Budget (EGP)</label>
              <input 
                type="number" 
                value={budget} 
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Favored Fabric Thread</label>
            <input 
              type="text" 
              value={fabric} 
              onChange={(e) => setFabric(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Linen weave, Cashmere, Egyptian Giza Cotton"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Color Palette (Select up to 3)
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {colorOptions.map((col) => {
                const isSelected = selectedColors.includes(col.hex);
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => handleColorToggle(col.hex)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-medium" 
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: col.hex }}></span>
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Interrogating Gemini Creative Studio...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Fit Template</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium">
              {successMsg}
            </div>
          )}
        </div>

        {/* Right Output Template Column */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col justify-between min-h-[400px]">
          {result ? (
            <div className="space-y-5 animate-fade-in" id="ai-concept-output">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Bespoke Blueprint</span>
                  <h3 className="font-bold text-slate-900 text-lg mt-1 font-display" id="ai-design-title">{result.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Estimated Production Fee</span>
                  <span className="text-xl font-extrabold text-slate-800 font-display">EGP {result.estimatedPrice}</span>
                </div>
              </div>

              <div>
                <p className="text-slate-600 text-sm leading-relaxed" id="ai-design-desc">{result.description}</p>
              </div>

              {/* Color swatches */}
              <div className="border-t border-b border-slate-200/60 py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase mb-1.5">Design Colors</span>
                  <div className="flex gap-2">
                    {result.colors.map((hex, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600 font-mono">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hex }}></span>
                        {hex}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block uppercase mb-1.5">Fibers Spec</span>
                  <div className="flex gap-1.5 justify-end flex-wrap">
                    {result.fabrics.map((fab, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded font-medium">
                        {fab}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sequential Steps */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tailor Production Plan</span>
                <div className="space-y-2">
                  {result.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-white p-2.5 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-600 text-xs leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleCommission}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  <PenTool className="w-4 h-4 text-emerald-400" />
                  <span>Commission this Design to Atelier Marco Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-12" id="ai-placeholder-layout">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800">Your AI Fit Suite is Ready</h4>
              <p className="text-slate-500 text-xs max-w-sm mt-2 leading-relaxed">
                Tune the custom garment fields on the left and invoke the Gemini design core. Our neural network will outline full fashion guides, material palettes, and sequential micro-sewing drapes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
