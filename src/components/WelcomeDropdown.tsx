/**
 * @file: WelcomeDropdown.tsx
 * @responsibility: Welcome dropdown with user profile options
 * @exports: WelcomeDropdown
 * @layer: components
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, Edit, LogOut, Settings } from "lucide-react";
import { UserProfile } from "./UserProfile";

interface WelcomeDropdownProps {
  onSignOut: () => void;
}

export const WelcomeDropdown = ({ onSignOut }: WelcomeDropdownProps) => {
  const { user, adminData } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);


  if (!user || !adminData) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 h-auto p-2 hover:bg-muted/50"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                Bem-vindo, {adminData.nome}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium">{adminData.nome}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setProfileOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={onSignOut}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de edição de perfil - renderizado apenas quando necessário */}
      {profileOpen && (
        <UserProfile 
          open={profileOpen} 
          onOpenChange={setProfileOpen} 
        />
      )}
    </>
  );
};
