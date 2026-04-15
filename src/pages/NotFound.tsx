import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">404 - Página Não Encontrada</CardTitle>
          <p className="text-muted-foreground">
            A página que você está procurando não existe
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.href = "/"}>
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;