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
  if (name.includes("twitch")) return { color: "bg-purple-600", icon: "🎮", label: "Twitch" };
  if (name.includes("soundcloud")) return { color: "bg-orange-500", icon: "☁️", label: "SoundCloud" };

  return { color: "bg-violet-600", icon: "🌐", label: "Social" };
}

export function getPlatformPlaceholder(categoryOrName: string): string {
  const name = categoryOrName.toLowerCase();

  if (name.includes("instagram")) return "https://instagram.com/yourprofile";
  if (name.includes("tiktok")) return "https://tiktok.com/@yourprofile";
  if (name.includes("youtube")) return "https://youtube.com/@yourprofile";
  if (name.includes("facebook")) return "https://facebook.com/yourprofile";
  if (name.includes("twitter") || name.includes("x")) return "https://x.com/yourprofile";
  if (name.includes("threads")) return "https://threads.net/@yourprofile";
  if (name.includes("whatsapp")) return "https://wa.me/1234567890";
  if (name.includes("telegram")) return "https://t.me/yourprofile";
  if (name.includes("spotify")) return "https://open.spotify.com/artist/yourprofile";
  if (name.includes("linkedin")) return "https://linkedin.com/in/yourprofile";
  if (name.includes("snapchat")) return "https://snapchat.com/add/yourprofile";
  if (name.includes("twitch")) return "https://twitch.tv/yourprofile";
  if (name.includes("soundcloud")) return "https://soundcloud.com/yourprofile";

  return "https://instagram.com/yourprofile";
}
