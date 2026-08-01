export function getPlatformMeta(categoryOrName: string) {
  const name = categoryOrName.toLowerCase();
  
  if (name.includes("instagram")) return { color: "bg-pink-600", icon: "📸", label: "Instagram" };
  if (name.includes("tiktok")) return { color: "bg-slate-900", icon: "🎵", label: "TikTok" };
  if (name.includes("youtube")) return { color: "bg-red-600", icon: "▶️", label: "YouTube" };
  if (name.includes("facebook")) return { color: "bg-blue-600", icon: "f", label: "Facebook" };
  if (name.includes("twitter") || name.includes("x")) return { color: "bg-slate-950", icon: "𝕏", label: "X" };
  if (name.includes("threads")) return { color: "bg-slate-900", icon: "🧵", label: "Threads" };
  if (name.includes("whatsapp")) return { color: "bg-green-600", icon: "💬", label: "WhatsApp" };
  if (name.includes("telegram")) return { color: "bg-sky-500", icon: "✈️", label: "Telegram" };
  if (name.includes("spotify")) return { color: "bg-green-500", icon: "🎧", label: "Spotify" };
  if (name.includes("linkedin")) return { color: "bg-blue-700", icon: "in", label: "LinkedIn" };
  if (name.includes("snapchat")) return { color: "bg-yellow-400", icon: "👻", label: "Snapchat" };
  if (name.includes("twitch")) return { color: "bg-purple-600", icon: "📺", label: "Twitch" };
  if (name.includes("soundcloud")) return { color: "bg-orange-500", icon: "☁️", label: "SoundCloud" };
  
  return { color: "bg-violet-600", icon: "⚡", label: "Social" };
}
