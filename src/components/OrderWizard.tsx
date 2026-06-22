import React, { useState } from "react";
import { Sparkles, Scissors, Info, Ruler, Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "../lib/api";
import { ClothingCategory, Fabric, Measurements, Customizations } from "../types";

interface OrderWizardProps {
  customerId: string;
  customerName: string;
  fabrics: Fabric[];
  onOrderCreated: () => void;
}

export default function OrderWizard({ customerId, customerName, fabrics, onOrderCreated }: OrderWizardProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ClothingCategory>("shirt");
  const [selectedTemplate, setSelectedTemplate] = useState({ id: "tpl_smart_shirt", title: "Oxford Dress Shirt", price: 1850 });
  const [color, setColor] = useState("Pearl White");
  const [selectedFabricId, setSelectedFabricId] = useState("");
  const [collarStyle, setCollarStyle] = useState("Cutaway Collar");
  const [sleeveStyle, setSleeveStyle] = useState("French Cuffs");
  const [embroidery, setEmbroidery] = useState("");
  const [notes, setNotes] = useState("");

  const [height, setHeight] = useState(180);
  const [chest, setChest] = useState(102);
  const [waist, setWaist] = useState(88);
  const [shoulder, setShoulder] = useState(46);
  const [sleeve, setSleeve] = useState(64);
  const [preferredSize, setPreferredSize] = useState<"M" | "L" | "XL" | "Custom">("M");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const garmentCategories = [
    { value: "shirt", label: "Custom Shirt", icon: "shirt", price: 1850, desc: "Bespoke shirts with customizable colors, linen thread options, and monograms." },
    { value: "pants", label: "Linen Trousers", icon: "scissors", price: 1200, desc: "Classic Mediterranean tailored linen trouser cuts." },
    { value: "dress", label: "Tailored Dress", icon: "sparkles", price: 2900, desc: "Indulgent gown and traditional dress designs." },
    { value: "jacket", label: "Structured Blazer", icon: "layers", price: 3500, desc: "Single/Double-breasted Italian fit suits." },
    { value: "abaya", label: "Egyptian Abaya", icon: "sparkles", price: 2400, desc: "Flowing breathable fabrics styled with desert oasis heritage cuts." }
  ];

  const presetsByCategory: Record<string, Array<{ id: string; title: string; price: number }>> = {
    shirt: [
      { id: "tpl_smart_shirt", title: "Oxford Dress Shirt", price: 1850 },
      { id: "tpl_casual_linen", title: "Summer Linen Casual", price: 1550 },
      { id: "tpl_tux_shirt", title: "Pleated Tuxedo Classic", price: 2200 }
    ],
    pants: [
      { id: "tpl_linen_pants", title: "Bespoke Linen Trousers", price: 1200 },
      { id: "tpl_smart_chinos", title: "Slim-fit Gabardine Chinos", price: 1400 }
    ],
    dress: [
      { id: "tpl_gala_gown", title: "Gala Velvet Gown", price: 3400 },
      { id: "tpl_summer_dress", title: "Giza Cotton Dress", price: 2200 }
    ],
    jacket: [
      { id: "tpl_blazer", title: "Sartorial Navy Blazer", price: 3200 },
      { id: "tpl_tweed_jacket", title: "Winter Wool Tweed Coat", price: 4200 }
    ],
    abaya: [
      { id: "tpl_heritage_abaya", title: "Lilac Desert Oasis Abaya", price: 2400 },
      { id: "tpl_embroidery_abaya", title: "Zari Hand-Stitched Abaya", price: 3100 }
    ]
  };

  const handleCategoryChange = (val: ClothingCategory) => {
    setCategory(val);
    const options = presetsByCategory[val] || [];
    if (options.length > 0) {
      setSelectedTemplate(options[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const fabricObj = fabrics.find(f => f.id === selectedFabricId);

    const customizations: Customizations = {
      color,
      fabricId: fabricObj?.id,
      fabricName: fabricObj?.name,
      collarStyle,
      sleeveStyle,
      embroidery,
      notes
    };

    const measurements: Measurements = {
      height,
      chest,
      waist,
      shoulder,
      sleeve,
      preferredSize
    };

    try {
      const resp = await api.createOrder({
        customerId,
        customerName,
        tailorId: "tailor_marco",
        tailorName: "Marco Rossi (The Tailor Shop)",
        supplierId: "supp_priya",
        category,
        templateId: selectedTemplate.id,
        templateTitle: selectedTemplate.title,
        customizations,
        measurements,
        deliveryAddress: "12 Road 9, Maadi, Cairo, Egypt",
        deliveryNotes: "Call when dispatched. Can leave with security.",
        paymentMethod: "CASH_ON_DELIVERY",
        totalPrice: selectedTemplate.price
      });

      setSuccessMsg(`🎉 Fashion commission created successfully! Tracking Reference: ${resp.orderNumber}`);
      onOrderCreated();
      // Reset wizard
      setStep(1);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit custom blueprint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="order-wizard-container">
      {/* Wizard Step Progression Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800 tracking-tight font-display">Bespoke Atelier Wizard</span>
        </div>
        <div className="flex gap-4">
          <span className={step >= 1 ? "font-bold text-indigo-600" : "text-slate-400"}>1. Category</span>
          <span className={step >= 2 ? "font-bold text-indigo-600" : "text-slate-400"}>2. Presets</span>
          <span className={step >= 3 ? "font-bold text-indigo-600" : "text-slate-400"}>3. Customize</span>
          <span className={step >= 4 ? "font-bold text-indigo-600" : "text-slate-400"}>4. Finish Fits</span>
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in" id="wizard-step-1">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Select Your Clothing Classification</h3>
              <p className="text-xs text-slate-500">Pick a baseline silhouette to load specific pocket structures, cuffs and fabric fits.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {garmentCategories.map((item) => {
                const isSelected = category === item.value;
                return (
                  <div
                    key={item.value}
                    onClick={() => handleCategoryChange(item.value as any)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50/40" 
                        : "border-slate-200 hover:border-slate-350 bg-white"
                    }`}
                  >
                    <h4 className="font-bold text-slate-800 text-xs">{item.label}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 lines-2 leading-relaxed">{item.desc}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Silhoutte fit</span>
                      <span className="text-xs font-extrabold text-indigo-600">EGP {item.price} base</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in" id="wizard-step-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Select Design Pattern Template</h3>
              <p className="text-xs text-slate-500">Choose a styled blueprint formulated by Marco (Atelier Tailor) or local freelance fashion designers.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(presetsByCategory[category] || []).map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50/45" 
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{tpl.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Ready for fabrication</p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">EGP {tpl.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in" id="wizard-step-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Fine-Tune Monograms & Cuffs</h3>
              <p className="text-xs text-slate-500">Align specific lapels, premium mother-of-pearl buttons, and your initials embroidery.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Aesthetic Shade</label>
                <input 
                  type="text" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Egyptian Fabric Roll</label>
                <select 
                  value={selectedFabricId} 
                  onChange={(e) => setSelectedFabricId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                >
                  <option value="">Aesthetic Color Dye Only</option>
                  {fabrics.map(f => (
                    <option key={f.id} value={f.id}>{f.name} (EGP {f.pricePerMeter}/m)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Collar Lapel Style</label>
                <select 
                  value={collarStyle} 
                  onChange={(e) => setCollarStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option>Cutaway Collar</option>
                  <option>Wide Notch Peak Lapel</option>
                  <option>Traditional Arab Round-Neck</option>
                  <option>Mandarin Collar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sleeve Layout</label>
                <select 
                  value={sleeveStyle} 
                  onChange={(e) => setSleeveStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option>French Cuffs</option>
                  <option>Single Button Mitered</option>
                  <option>Flared Kaftan Sleeve</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Monogram / Custom Embroidery Initials (Optional)</label>
                <input 
                  type="text" 
                  value={embroidery} 
                  onChange={(e) => setEmbroidery(e.target.value)}
                  className="w-full bg-indigo-50/20 border border-indigo-250/20 rounded-lg px-3 py-2 text-xs text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. 'AR' on left French sleeve in dark navy cashmere thread"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Precise Crafting Notes</label>
                <textarea 
                  rows={2}
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Tell our sewing masters if you need a relax-cut crotch height or loose chests."
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in" id="wizard-step-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Register Tailorship Measurements</h3>
              <p className="text-xs text-slate-500">Provide direct dimensions in centimeters (cm). Use our Virtual Try-On if you need to calculate fit overlays.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chest Fit (cm)</label>
                <input 
                  type="number" 
                  value={chest} 
                  onChange={(e) => setChest(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Waist (cm)</label>
                <input 
                  type="number" 
                  value={waist} 
                  onChange={(e) => setWaist(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shoulder (cm)</label>
                <input 
                  type="number" 
                  value={shoulder} 
                  onChange={(e) => setShoulder(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sleeve Length</label>
                <input 
                  type="number" 
                  value={sleeve} 
                  onChange={(e) => setSleeve(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Primary Reference Size</label>
              <div className="flex gap-2">
                {(["M", "L", "XL", "Custom"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPreferredSize(sz)}
                    className={`py-1.5 px-4 rounded-md border text-xs font-bold cursor-pointer transition-all ${
                      preferredSize === sz
                        ? "border-slate-800 bg-slate-900 text-white shadow"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Size {sz}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                {successMsg}
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-6" id="wizard-navigation-buttons">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting custom sewing request...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Commission Custom Garment Now</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
