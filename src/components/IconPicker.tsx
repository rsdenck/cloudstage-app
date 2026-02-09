"use client";

import { useState } from "react";
import { Search, X, Smile, Icons } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  currentIcon?: string | null;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

const MATERIAL_ICONS = [
  "home", "settings", "description", "folder", "article", "dashboard", 
  "info", "help", "star", "favorite", "search", "menu", "close", "add", 
  "edit", "delete", "share", "visibility", "cloud", "public", "lock", 
  "person", "group", "mail", "notifications", "chat", "image", "videocam", 
  "audio_file", "attach_file", "link", "event", "schedule", "language", 
  "terminal", "code", "storage", "analytics", "assessment", "extension"
];

const EMOJIS = [
  "🌐", "📚", "📄", "📁", "🚀", "💡", "🛠️", "⚙️", "🔒", "🔑", 
  "📝", "📊", "🎯", "🎨", "💻", "📱", "🔥", "✨", "✅", "❌",
  "⭐", "📌", "🌈", "🍎", "🍕", "⚽", "🚗", "🏠", "🎁", "💬"
];

export function IconPicker({ currentIcon, onSelect, onClose }: IconPickerProps) {
  const [activeTab, setActiveTab] = useState<"emoji" | "material">(
    currentIcon?.startsWith("mi:") ? "material" : "emoji"
  );
  const [search, setSearch] = useState("");

  const filteredMaterialIcons = MATERIAL_ICONS.filter(icon => 
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0F0F0F] border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Escolher Ícone</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("emoji")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all",
              activeTab === "emoji" ? "text-green-500 bg-green-500/5 border-b-2 border-green-500" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Smile className="w-4 h-4" />
            Emojis
          </button>
          <button
            onClick={() => setActiveTab("material")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all",
              activeTab === "material" ? "text-green-500 bg-green-500/5 border-b-2 border-green-500" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="material-icons text-[18px]">category</span>
            Material Icons
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>

          <div className="h-64 overflow-y-auto no-scrollbar grid grid-cols-6 gap-2 p-1">
            {activeTab === "emoji" ? (
              EMOJIS.filter(e => e.includes(search) || search === "").map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                  className={cn(
                    "h-10 flex items-center justify-center text-xl rounded-lg hover:bg-white/10 transition-all",
                    currentIcon === emoji && "bg-green-500/20 ring-1 ring-green-500"
                  )}
                >
                  {emoji}
                </button>
              ))
            ) : (
              filteredMaterialIcons.map(icon => (
                <button
                  key={icon}
                  onClick={() => {
                    onSelect(`mi:${icon}`);
                    onClose();
                  }}
                  className={cn(
                    "h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-zinc-400 hover:text-white",
                    currentIcon === `mi:${icon}` && "bg-green-500/20 text-green-500 ring-1 ring-green-500"
                  )}
                  title={icon}
                >
                  <span className="material-icons text-[20px]">{icon}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-white/5 flex justify-end">
          <button
            onClick={() => {
              onSelect("");
              onClose();
            }}
            className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
          >
            Remover ícone
          </button>
        </div>
      </div>
    </div>
  );
}
