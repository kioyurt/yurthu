import { Heart, Mail } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/ui/BrandIcons";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-800/50 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
        <div className="flex justify-center gap-4">
          {[GithubIcon, TwitterIcon, Mail].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
          Made with <Heart size={14} className="text-red-500 fill-red-500" /> © 2026 kioyurt
        </p>
      </div>
    </footer>
  );
}