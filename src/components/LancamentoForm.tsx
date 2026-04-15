/**
 * @file: LancamentoForm.tsx
 * @responsibility: Form for creating/editing lancamentos
 * @exports: LancamentoForm
 * @layer: components
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LancamentoInput } from "@/types/Lancamento";
import { useEffect, useState } from "react";
import { getProfissionais } from "@/services/profissionalService";
import { getConfig } from "@/services/configService";

const formSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().optional(),
  valor_atendimento: z.string().min(1, "Valor é obrigatório").refine(
    (val) => parseFloat(val) > 0,
    "Valor deve ser maior que zero"
  ),
  valor_pago: z.string().min(1, "Valor pago é obrigatório"),
  troco: z.string().refine(
    (val) => parseFloat(val) >= 0,
    "Troco não pode ser negativo"
  ),
  profissional: z.string().min(1, "Profissional é obrigatório"),
  forma_pagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
}).refine(
  (data) => parseFloat(data.valor_pago) >= parseFloat(data.valor_atendimento),
  {
    message: "Valor pago deve ser maior ou igual ao valor do atendimento",
    path: ["valor_pago"],
  }
);

interface LancamentoFormProps {
  onSubmit: (data: LancamentoInput) => void;
  onCancel: () => void;
  defaultValues?: Partial<LancamentoInput>;
}

export const LancamentoForm = ({ onSubmit, onCancel, defaultValues }: LancamentoFormProps) => {
  // Função para obter data atual no fuso horário de Brasília
  const getDataBrasilia = () => {
    const agora = new Date();
    const brasiliaOffset = -3 * 60; // UTC-3 (Brasília)
    const utc = agora.getTime() + (agora.getTimezoneOffset() * 60000);
    const brasilia = new Date(utc + (brasiliaOffset * 60000));
    return brasilia;
  };
  
  const today = getDataBrasilia().toISOString().split('T')[0];
  const [profissionais, setProfissionais] = useState<Array<{nome: string, repasse_pct: number}>>([]);
  // Formas de pagamento pré-definidas
  const formasPagamentoPredefinidas = [
    'PIX',
    'Cartão Débito', 
    'Cartão Crédito',
    'Dinheiro'
  ];
  
  const [formasPagamento, setFormasPagamento] = useState<string[]>(formasPagamentoPredefinidas);
  
  useEffect(() => {
    const loadData = async () => {
      const { data: profs } = await getProfissionais();
      setProfissionais(profs?.map(p => ({nome: p.nome, repasse_pct: p.repasse_pct})) || []);
      
      // Tentar carregar formas de pagamento da configuração, mas usar as pré-definidas como fallback
      try {
        const { data: config } = await getConfig();
        if (config?.formas_pagamento && config.formas_pagamento.length > 0) {
          setFormasPagamento(config.formas_pagamento);
        } else {
          setFormasPagamento(formasPagamentoPredefinidas);
        }
      } catch (error) {
        console.log('Usando formas de pagamento pré-definidas');
        setFormasPagamento(formasPagamentoPredefinidas);
      }
    };
    loadData();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: defaultValues?.data || today,
      valor_atendimento: defaultValues?.valor_atendimento?.toString() || "",
      valor_pago: defaultValues?.valor_pago?.toString() || "",
      troco: defaultValues?.troco?.toString() || "0",
      profissional: defaultValues?.profissional || "",
      forma_pagamento: defaultValues?.forma_pagamento || "",
    },
  });

  const watchValorAtendimento = form.watch("valor_atendimento");
  const watchValorPago = form.watch("valor_pago");
  const watchProfissional = form.watch("profissional");


  useEffect(() => {
    const atendimento = parseFloat(watchValorAtendimento) || 0;
    const pago = parseFloat(watchValorPago) || 0;
    
    if (pago >= atendimento && pago > 0) {
      const trocoCalculado = pago - atendimento;
      form.setValue("troco", trocoCalculado.toFixed(2));
    }
  }, [watchValorAtendimento, watchValorPago, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Buscar o percentual de repasse do profissional selecionado
    const profissionalSelecionado = profissionais.find(p => p.nome === values.profissional);
    const repasse_pct = profissionalSelecionado?.repasse_pct || 0;
    
    // Garantir que a data seja salva no formato correto (YYYY-MM-DD)
    // A data já vem do input como YYYY-MM-DD, então não precisa de conversão adicional
    const data: LancamentoInput = {
      data: values.data, // Já está no formato YYYY-MM-DD
      descricao: values.descricao,
      valor_atendimento: parseFloat(values.valor_atendimento),
      valor_pago: parseFloat(values.valor_pago),
      troco: parseFloat(values.troco),
      profissional: values.profissional,
      forma_pagamento: values.forma_pagamento,
      repasse_pct: repasse_pct,
    };
    onSubmit(data);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Atendimento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Limpeza de pele, Depilação..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor_atendimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Atendimento</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="R$ 150,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor_pago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Pago</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="R$ 150,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="troco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Troco</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="R$ 0,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profissional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {profissionais.map((prof) => (
                    <SelectItem key={prof.nome} value={prof.nome}>
                      {prof.nome} ({prof.repasse_pct}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="forma_pagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
};
