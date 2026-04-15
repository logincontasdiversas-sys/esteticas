/**
 * @file: Logo.tsx
 * @responsibility: LYB logo component with elegant styling
 * @exports: Logo
 * @layer: components
 */

import { Sparkles } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Sparkles className="h-8 w-8 text-primary" />
      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
        LYB
      </span>
    </div>
  );
};