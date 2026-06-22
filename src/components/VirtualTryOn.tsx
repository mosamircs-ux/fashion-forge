import React, { useState } from "react";
import { Sparkles, ShoppingBag, Eye, Maximize, UserCheck, Sliders } from "lucide-react";

export default function VirtualTryOn() {
  const [activeCategory, setActiveCategory] = useState<"shirt" | "pants" | "dress" | "jacket" | "suit" | "abaya">("shirt");
  const [bodyType, setBodyType] = useState<"athletic" | "slim" | "relaxed">("athletic");
  const [opacity, setOpacity] = useState(85);
  const [garmentColor, setGarmentColor] = useState("#E67E22"); // secondary orange default

  const colorSwatches = [
    { name: "Navy Blue", hex: "#1B2A47" },
    { name: "Sienna Orange", hex: "#E67E22" },
    { name: "Linen Beige", hex: "#D2C5B1" },
    { name: "Classic Charcoal", hex: "#2C3E50" },
    { name: "Forest Moss", hex: "#2C5D44" },
    { name: "Coral Rose", hex: "#E74C3C" },
    { name: "Burgundy Wine", hex: "#8E44AD" },
    { name: "Pure Pearl", hex: "#F5F7FA" }
  ];

  const presets = [
    { title: "Sartorial Blazer", category: "jacket" as const, desc: "Slight shoulder drapes, raw edge lapels", color: "#1B2A47" },
    { title: "Giza Premium Linen Shirt", category: "shirt" as const, desc: "Clean French sleeves, cutaway collar", color: "#D2C5B1" },
    { title: "Mediterranean Linen Pants", category: "pants" as const, desc: "Double welt pocket pockets, tailored seat", color: "#2E4053" },
    { title: "Lilac Velvet Abaya", category: "abaya" as const, desc: "Elegant drape folds, comfort sleeves", color: "#9B59B6" },
  ];

  // SVG dimensions & coordinates matching body configurations to build a beautiful vector model
  const bodyWidth = bodyType === "slim" ? 75 : bodyType === "relaxed" ? 115 : 95;
  const chestOffset = bodyType === "slim" ? 15 : bodyType === "relaxed" ? 5 : 10;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="virtual-try-on-block">
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold tracking-tight text-base font-display">Virtual AR Fit Simulator</h2>
        </div>
        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
          Interactive Try-On Mannequin
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive SVG Canvas Display */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl p-6 relative flex flex-col items-center justify-center min-h-[420px] select-none shadow-inner border border-slate-800">
          <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur text-[10px] uppercase font-bold text-slate-400 px-2 py-1 rounded tracking-wider">
            Mannequin Canvas: {bodyType.toUpperCase()}
          </div>

          {/* Canvas SVG Figure */}
          <div className="w-full max-w-[260px] h-[340px] flex items-center justify-center">
            <svg viewBox="0 0 200 300" className="w-full h-full" id="mannequin-vector-canvas">
              {/* Grid backdrop */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2c3e50" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" opacity="0.15" />

              {/* Mannequin Head */}
              <circle cx="100" cy="50" r="18" fill="#3D4E63" stroke="#566A82" strokeWidth="2" />
              <path d="M 92 68 L 108 68 L 105 78 L 95 78 Z" fill="#3D4E63" />

              {/* Mannequin Body / Torso depending on reactive state bodyWidth */}
              <path 
                d={`M ${100 - bodyWidth/2} 80 
                    L ${100 + bodyWidth/2} 80 
                    L ${100 + bodyWidth/2 - chestOffset} 180 
                    L ${100 - bodyWidth/2 + chestOffset} 180 Z`} 
                fill="#34495E" 
                stroke="#4E647D" 
                strokeWidth="2.5" 
                className="transition-all duration-300"
              />

              {/* Legs */}
              <rect x="78" y="180" width="16" height="100" rx="3" fill="#2C3E50" stroke="#3D4E63" />
              <rect x="106" y="180" width="16" height="100" rx="3" fill="#2C3E50" stroke="#3D4E63" />

              {/* Garment Overlay Layer - Dynamic color, category & opacity style */}
              <g id="garment-overlay" style={{ opacity: opacity / 100 }} className="transition-all duration-500">
                {activeCategory === "shirt" && (
                  <path 
                    d={`M ${100 - bodyWidth/2 - 3} 80 
                        L ${100 + bodyWidth/2 + 3} 80 
                        L ${100 + bodyWidth/2 - chestOffset + 2} 175 
                        L ${100 - bodyWidth/2 + chestOffset - 2} 175 Z`} 
                    fill={garmentColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-300 shadow"
                  />
                )}

                {activeCategory === "jacket" && (
                  <g>
                    <path 
                      d={`M ${100 - bodyWidth/2 - 5} 80 
                          L ${100 + bodyWidth/2 + 5} 80 
                          L ${100 + bodyWidth/2 - chestOffset + 5} 175 
                          L ${100 - bodyWidth/2 + chestOffset - 5} 175 Z`} 
                      fill={garmentColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-300"
                    />
                    {/* Lapel design details */}
                    <path d="M 100 80 L 85 120 L 100 135 L 115 120 Z" fill="#2C3E50" opacity="0.3" />
                  </g>
                )}

                {activeCategory === "pants" && (
                  <g>
                    <rect x="76" y="172" width="20" height="110" rx="2" fill={garmentColor} stroke="#ffffff" />
                    <rect x="104" y="172" width="20" height="110" rx="2" fill={garmentColor} stroke="#ffffff" />
                    <rect x="76" y="170" width="48" height="20" rx="1" fill={garmentColor} />
                  </g>
                )}

                {activeCategory === "abaya" && (
                  <path 
                    d={`M ${100 - bodyWidth/2 - 8} 80 
                        L ${100 + bodyWidth/2 + 8} 80 
                        L ${135} 275 
                        L ${65} 275 Z`} 
                    fill={garmentColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                )}

                {activeCategory === "dress" && (
                  <path 
                    d={`M 75 80 L 125 80 L 132 150 L 145 250 L 55 250 L 68 150 Z`} 
                    fill={garmentColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                )}

                {activeCategory === "suit" && (
                  <g>
                    {/* Pants */}
                    <rect x="76" y="170" width="20" height="112" rx="2" fill={garmentColor} stroke="#ffffff" />
                    <rect x="104" y="170" width="20" height="112" rx="2" fill={garmentColor} stroke="#ffffff" />
                    {/* Jacket on Torso */}
                    <path 
                      d={`M ${100 - bodyWidth/2 - 4} 80 
                          L ${100 + bodyWidth/2 + 4} 80 
                          L ${100 + bodyWidth/2 - chestOffset + 4} 175 
                          L ${100 - bodyWidth/2 + chestOffset - 4} 175 Z`} 
                      fill={garmentColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    {/* Tie element */}
                    <path d="M 100 80 L 97 120 L 100 126 L 103 120 Z" fill="#ffffff" />
                  </g>
                )}
              </g>
            </svg>
          </div>

          <div className="absolute bottom-3 text-slate-500 text-[10px] font-mono tracking-tight text-center">
            Realtime CSS Overlay Renderer • Opacity {opacity}%
          </div>
        </div>

        {/* Right Controls Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6" id="tryon-sliders-box">
          
          <div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Garment Category</span>
            <div className="grid grid-cols-3 gap-2 mt-2" id="garment-category-switching">
              {(["shirt", "pants", "dress", "jacket", "suit", "abaya"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer text-center capitalize transition-all ${
                    activeCategory === cat
                      ? "border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat === "abaya" ? "Egyptian Abaya" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Body Presets</span>
              <div className="flex flex-col gap-1.5 mt-2">
                {(["athletic", "slim", "relaxed"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer text-left transition-all capitalize ${
                      bodyType === type
                        ? "border-slate-800 bg-slate-900 text-white shadow"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type === "relaxed" ? "Relaxed Fit (" + type + ")" : type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Fine-tuning Slider</span>
              <div className="space-y-3 mt-2">
                <label className="text-xs text-slate-500 block">Drape Opacity (%)</label>
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{opacity}%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider block mb-2.5">
              Available Raw Colors
            </span>
            <div className="grid grid-cols-4 gap-2">
              {colorSwatches.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setGarmentColor(color.hex)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all ${
                    garmentColor === color.hex
                      ? "border-indigo-600 bg-indigo-50/55"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full border border-slate-300" style={{ backgroundColor: color.hex }}></span>
                  <span className="text-[10px] text-slate-600 font-medium truncate max-w-full">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2.5">Quick Design Presets Inspiration</span>
            <div className="grid grid-cols-2 gap-3" id="tryon-inspire-grid">
              {presets.map((pre, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setActiveCategory(pre.category);
                    setGarmentColor(pre.color);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-indigo-400 cursor-pointer transition-all flex items-center gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: pre.color }}></div>
                  <div className="truncate">
                    <h5 className="text-[11px] font-bold text-slate-800 truncate">{pre.title}</h5>
                    <p className="text-[10px] text-slate-500 truncate capitalize">{pre.category} • Preset {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
