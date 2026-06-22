import React, { useState } from "react";
import { Map, Pin, CheckCircle, Navigation, Layers, Scissors, Truck, Phone } from "lucide-react";

interface LocationNode {
  id: string;
  name: string;
  type: "tailor" | "supplier" | "customer" | "delivery";
  neighborhood: string;
  coords: { x: number; y: number };
  phone: string;
  address: string;
  desc: string;
  status?: string;
}

export default function CairoMap() {
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>({
    id: "loc_tailor",
    name: "Marco Rossi (The Tailor Shop)",
    type: "tailor",
    neighborhood: "Zamalek, Cairo",
    coords: { x: 140, y: 150 },
    phone: "+20 120 789 0123",
    address: "45 Hassan Sabry St, Zamalek, Cairo, Egypt",
    desc: "Premium bespoke clothing workshop. Highly skilled in Italian tailoring, structured suits, and monograms.",
    status: "Active Fabrication Hub"
  });

  const [activeRoute, setActiveRoute] = useState<"none" | "supply" | "delivery">("supply");

  const nodes: LocationNode[] = [
    {
      id: "loc_supplier",
      name: "Priya Nair (Global Textiles)",
      type: "supplier",
      neighborhood: "6th of October, Giza",
      coords: { x: 50, y: 220 },
      phone: "+20 110 456 7890",
      address: "Industrial Zone 3, 6th of October City, Giza, Egypt",
      desc: "Supplier of luxury raw fabrics, finest cotton lines, linen, and buttons.",
      status: "Inventory Dispatch Active"
    },
    {
      id: "loc_tailor",
      name: "Marco Rossi (The Tailor Shop)",
      type: "tailor",
      neighborhood: "Zamalek, Cairo",
      coords: { x: 140, y: 150 },
      phone: "+20 120 789 0123",
      address: "45 Hassan Sabry St, Zamalek, Cairo, Egypt",
      desc: "Premium bespoke clothing workshop. Highly skilled in Italian tailoring, structured suits, and monograms.",
      status: "Active Fabrication Hub"
    },
    {
      id: "loc_customer",
      name: "Alex Rivera (Customer Suite)",
      type: "customer",
      neighborhood: "Maadi, Cairo",
      coords: { x: 180, y: 240 },
      phone: "+20 100 123 4567",
      address: "12 Road 9, Maadi, Cairo, Egypt",
      desc: "End-client receiving luxury customized suit lines.",
      status: "Awaiting Order Delivery"
    },
    {
      id: "loc_delivery",
      name: "Karim Hassan (Forge Dispatch)",
      type: "delivery",
      neighborhood: "Heliopolis, Cairo",
      coords: { x: 230, y: 80 },
      phone: "+20 150 987 6543",
      address: "88 El Merghany St, Heliopolis, Cairo, Egypt",
      desc: "Logistics vehicle dispatch point supplying hanger-safe bags.",
      status: "Fleet Active on Cairo Roads"
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="cairo-map-block">
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold tracking-tight text-base font-display">Cairo Interactive Supply Map</h2>
        </div>
        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
          Atelier Logistics Platform
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Vector SVG Cairo Map with route paths */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl relative overflow-hidden min-h-[380px] flex items-center justify-center border border-slate-800 shadow-inner">
          
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur rounded-lg p-2.5 border border-slate-800 text-[11px] font-medium text-slate-300 space-y-1 z-10 shadow">
            <div className="font-bold text-white uppercase text-xs mb-1">Ecosystem Nodes</div>
            <div className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-teal-400" /> 6th October (Supplier)</div>
            <div className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-indigo-400" /> Zamalek (Tailor Shop)</div>
            <div className="flex items-center gap-1.5"><Pin className="w-3.5 h-3.5 text-rose-450" style={{ color: "#E67E22"}} /> Maadi (Client Suite)</div>
            <div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-amber-400" /> Heliopolis (Logistics)</div>
          </div>

          <div className="absolute top-3 right-3 text-[10px] uppercase bg-slate-900/60 text-slate-500 px-1.5 py-0.5 rounded font-mono tracking-wider">
            Nile Delta Bounds
          </div>

          <svg viewBox="0 0 300 300" className="w-full h-full max-w-[360px]" id="cairo-vector-map">
            {/* The Nile River (winding pathway from bottom to top) */}
            <path 
              d="M 170 300 Q 155 240 180 200 T 135 150 T 150 70 Q 140 30 145 0" 
              fill="none" 
              stroke="#1b4f72" 
              strokeWidth="10" 
              opacity="0.6" 
            />
            <path 
              d="M 170 300 Q 155 240 180 200 T 135 150 T 150 70 Q 140 30 145 0" 
              fill="none" 
              stroke="#2e86c1" 
              strokeWidth="5" 
              opacity="0.8" 
            />

            {/* Micro-neighborhood outline highlights */}
            <circle cx="50" cy="220" r="28" fill="#16a085" opacity="0.08" />
            <text x="50" y="240" fill="#16a085" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.6">GIZA</text>

            <circle cx="140" cy="150" r="24" fill="#2980b9" opacity="0.1" />
            <text x="140" y="140" fill="#2980b9" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.6">ZAMALEK</text>

            <circle cx="180" cy="240" r="24" fill="#e67e22" opacity="0.1" />
            <text x="180" y="260" fill="#e67e22" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.6">MAADI</text>

            <circle cx="230" cy="80" r="30" fill="#f1c40f" opacity="0.08" />
            <text x="230" y="65" fill="#f1c40f" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.6">HELIOPOLIS</text>

            {/* Dynamic Transit Route Lines depending on current state */}
            {activeRoute === "supply" && (
              <path 
                d="M 50 220 C 100 220, 100 150, 140 150" 
                fill="none" 
                stroke="#1abc9c" 
                strokeWidth="2.5" 
                strokeDasharray="6 3" 
                className="animate-[dash_10s_linear_infinite]" 
              />
            )}

            {activeRoute === "delivery" && (
              <path 
                d="M 140 150 C 200 150, 200 240, 180 240" 
                fill="none" 
                stroke="#e67e22" 
                strokeWidth="2.5" 
                strokeDasharray="6 3" 
              />
            )}

            {/* Ring indicators on Map of Cairo */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const color = 
                node.type === "supplier" ? "#1abc9c" : 
                node.type === "tailor" ? "#3498db" : 
                node.type === "customer" ? "#e67e22" : "#f1c40f";

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.coords.x}, ${node.coords.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle r={isSelected ? 10 : 6} fill={color} opacity="0.4" className="animate-ping" style={{ animationDuration: "3s" }} />
                  <circle r={isSelected ? 7 : 4.5} fill={color} stroke="#ffffff" strokeWidth="1.5" className="transition-all" />
                  <text 
                    y="-12" 
                    fill="#ffffff" 
                    fontSize="7.5" 
                    fontWeight="bold" 
                    textAnchor="middle" 
                    className="font-sans opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 py-0.5 rounded"
                  >
                    {node.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Location route controls in Cairo */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur rounded-lg p-1.5 border border-slate-800 flex items-center gap-1.5 text-xs text-slate-350">
            <span className="text-[10px] uppercase font-bold text-slate-500">Overlay Route:</span>
            <button 
              onClick={() => setActiveRoute("supply")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                activeRoute === "supply" ? "bg-teal-700 text-white" : "hover:bg-slate-850 text-slate-400"
              }`}
            >
              Material Supply
            </button>
            <button 
              onClick={() => setActiveRoute("delivery")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                activeRoute === "delivery" ? "bg-amber-700 text-white" : "hover:bg-slate-850 text-slate-400"
              }`}
            >
              Tailor to client
            </button>
          </div>
        </div>

        {/* Right Side: Selected Profile details */}
        <div className="lg:col-span-5 flex flex-col justify-between" id="map-pin-details">
          {selectedNode ? (
            <div className="space-y-4 animate-fade-in" id="cairo-node-output">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                    selectedNode.type === "supplier" ? "bg-teal-100 text-teal-800" :
                    selectedNode.type === "tailor" ? "bg-blue-100 text-blue-800" :
                    selectedNode.type === "customer" ? "bg-amber-100 text-amber-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {selectedNode.type.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2 font-display">{selectedNode.name}</h3>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedNode.neighborhood}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedNode.phone}</span>
                </div>
              </div>

              <div>
                <p className="text-slate-600 text-xs leading-relaxed font-sans">{selectedNode.desc}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide mb-1">Detailed Hub Bio</span>
                <p className="text-[11px] text-slate-500 italic bg-gray-50 border-l-2 border-indigo-500 p-2 rounded">
                  {selectedNode.address}
                </p>
              </div>

              {selectedNode.status && (
                <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">{selectedNode.status}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-12">
              <p className="text-slate-500 text-sm">Select a pinned node on the Cairo Nile Delta coordinate layout to fly-to detail profiles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
