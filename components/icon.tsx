import {
  Anchor, BookOpen, BriefcaseBusiness, CalendarDays, CalendarRange, Clock3, CloudDrizzle, CloudSun, Compass, EyeOff,
  Feather, HeartHandshake, Leaf, LifeBuoy, MessagesSquare, MoonStar, Mountain, Smile, Sparkles, Sprout, Sun, Waves, Wind,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Anchor, BookOpen, BriefcaseBusiness, CalendarDays, CalendarRange, Clock3, CloudDrizzle, CloudSun, Compass, EyeOff,
  Feather, HeartHandshake, Leaf, LifeBuoy, MessagesSquare, MoonStar, Mountain, Smile, Sparkles, Sprout, Sun, Waves, Wind,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name] ?? Sparkles;
  return <C className={className} aria-hidden />;
}

export const toneBg: Record<string, string> = {
  lilac: "bg-lilac/30 text-indigo-ink",
  sage: "bg-sage/40 text-sage-deep",
  peach: "bg-peach/40 text-peach-deep",
  mist: "bg-mist text-indigo-deep",
  indigo: "bg-indigo/20 text-indigo-ink",
};
