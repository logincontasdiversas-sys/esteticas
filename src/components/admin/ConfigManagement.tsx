/**
 * @file: ConfigManagement.tsx
 * @responsibility: Admin panel for global configurations
 * @exports: ConfigManagement
 * @layer: components/admin
 */

import { useState, useEffect } from "react";
import { getConfig, updateConfig, Config } from "@/services/configService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings } from "lucide-react";

export const ConfigManagement = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [threshold, setThreshold] = useState('5');
  const [formasPagamento, setFormasPagamento] = useState('');
  const [tiposSaldo, setTiposSaldo] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const { data, error } = await getConfig();
    if (error) {
      toast.error('Erro ao carregar configurações', { description: error.message });
    } else if (data) {
      setConfig(data);
      setThreshold((data.threshold_alerta_trocos || 5).toString());
      setFormasPagamento(data.formas_pagamento?.join(', ') || 'PIX, Cartão Débito, Cartão Crédito, Dinheiro');
      setTiposSaldo(data.tipos_saldo?.join(', ') || 'Dinheiro, PIX, Débito em Conta, Cartão de Crédito, Transferência Bancária, Outros');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config) return;
    
    const thresholdNum = parseFloat(threshold);
    
    if (thresholdNum < 0 || thresholdNum > 100) {
      toast.error('Threshold deve estar entre 0 e 100');
      return;
    }
    
    const formasArray = formasPagamento.split(',').map(f => f.trim()).filter(f => f);
    const tiposArray = tiposSaldo.split(',').map(t => t.trim()).filter(t => t);
    
    if (formasArray.length === 0) {
      toast.error('Adicione pelo menos uma forma de pagamento');
      return;
    }
    
    if (tiposArray.length === 0) {
      toast.error('Adicione pelo menos um tipo de saldo');
      return;
    }
    
    setSaving(true);
    const { error } = await updateConfig(config.id, {
      threshold_alerta_trocos: thresholdNum,
      formas_pagamento: formasArray,
      tipos_saldo: tiposArray,
    });
    
    if (error) {
      toast.error('Erro ao salvar configurações', { description: error.message });
    } else {
      toast.success('Configurações atualizadas!');
      loadConfig();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <CardTitle>Configurações Globais</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold de Alerta de Trocos (%)</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="5.00"
            />
            <p className="text-xs text-muted-foreground">
              Percentual do saldo bruto que gera alerta de trocos excessivos
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="formas">Formas de Pagamento</Label>
            <Input
              id="formas"
              type="text"
              value={formasPagamento}
              onChange={(e) => setFormasPagamento(e.target.value)}
              placeholder="Pix, Cartão Débito, Cartão Crédito, Dinheiro"
            />
            <p className="text-xs text-muted-foreground">
              Separe as formas por vírgula (ex: Pix, Cartão, Dinheiro)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipos">Tipos de Saldo Inicial</Label>
            <Input
              id="tipos"
              type="text"
              value={tiposSaldo}
              onChange={(e) => setTiposSaldo(e.target.value)}
              placeholder="Dinheiro, PIX, Débito em Conta, Cartão de Crédito, Transferência Bancária, Outros"
            />
            <p className="text-xs text-muted-foreground">
              Separe os tipos por vírgula (ex: Dinheiro, PIX, Débito em Conta)
            </p>
          </div>
          
          <div className="pt-4">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};