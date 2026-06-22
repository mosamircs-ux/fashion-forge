import React from "react";
import { UserRole } from "../types";
import { Sparkles, Scissors, Truck, Layers } from "lucide-react";

interface RoleSwitcherProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
}

export default function RoleSwitcher({ currentUserId, onUserChange }: RoleSwitcherProps) {
  const characters = [
    { id: "cust_alex", name: "Alex (Client)", role: UserRole.CUSTOMER, icon: Sparkles, color: "bg-amber-100 text-amber-800 border-amber-200" },
    { id: "tailor_marco", name: "Marco (Tailor)", role: UserRole.TAILOR, icon: Scissors, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { id: "supp_priya", name: "Priya (Supplier)", role: UserRole.SUPPLIER, icon: Layers, color: "bg-teal-100 text-teal-800 border-teal-200" },
    { id: "del_karim", name: "Karim (Delivery)", role: UserRole.DELIVERY, icon: Truck, color: "bg-rose-100 text-rose-800 border-rose-200" }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs" id="role-switcher-container">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-500 uppercase tracking-wider">Active Workspace View:</span>
        <span className="text-gray-400">| Toggle to test different actor perspectives</span>
      </div>
      <div className="flex flex-wrap gap-1.5" id="switcher-buttons">
        {characters.map((char) => {
          const Icon = char.icon;
          const isActive = char.id === currentUserId;
          return (
            <button
              key={char.id}
              onClick={() => onUserChange(char.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                isActive 
                  ? `${char.color} shadow-sm scale-105 ring-1 ring-primary-navy/20` 
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
              id={`switch-to-${char.id}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{char.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
