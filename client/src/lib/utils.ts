import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utility
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Truncate text for previews
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Dynamic category badge color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Productivity': 'bg-soft-coral text-white',
    'Wellness': 'bg-pastel-yellow text-dark-gray',
    'Books': 'bg-soft-lavender text-white',
    'Lifestyle': 'bg-soft-gray text-dark-gray',
    'Mindfulness': 'bg-soft-gray text-dark-gray',
    'Self-Growth': 'bg-soft-gray text-dark-gray',
  };
  
  return colors[category] || 'bg-muted-blue text-white';
}
