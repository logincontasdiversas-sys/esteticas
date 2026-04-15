import { supabase } from '../integrations/supabase/client';

export interface SaldoInicial {
  id: number;
  mes: number;
  ano: number;
  saldo_inicial: number;
  tipo_saldo: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  usuario?: {
    nome: string;
  };
}

export interface SaldoInicialInput {
  mes: number;
  ano: number;
  saldo_inicial: number;
  tipo_saldo: string;
  observacoes?: string;
}

export interface FluxoCaixa {
  saldo_inicial: number;
  total_entradas: number;
  total_saidas: number;
  saldo_atual: number;
  detalhes: {
    entradas: {
      lancamentos: number;
      outros: number;
    };
    saidas: {
      repasses_profissionais: number;
      trocos: number;
      outros: number;
    };
  };
}

export const saldoInicialService = {
  // Buscar saldo inicial do mês atual
  async getSaldoInicialAtual(): Promise<SaldoInicial | null> {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    const { data, error } = await supabase
      .from('saldo_inicial')
      .select('*')
      .eq('mes', mes)
      .eq('ano', ano)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar saldo inicial:', error);
      return null;
    }

    return data;
  },

  // Buscar saldo inicial de um mês específico
  async getSaldoInicial(mes: number, ano: number): Promise<SaldoInicial | null> {
    const { data, error } = await supabase
      .from('saldo_inicial')
      .select('*')
      .eq('mes', mes)
      .eq('ano', ano)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar saldo inicial:', error);
      return null;
    }

    return data;
  },

  // Criar ou atualizar saldo inicial
  async upsertSaldoInicial(input: SaldoInicialInput): Promise<SaldoInicial | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('saldo_inicial')
        .upsert({
          mes: input.mes,
          ano: input.ano,
          saldo_inicial: input.saldo_inicial,
          tipo_saldo: input.tipo_saldo,
          observacoes: input.observacoes,
          created_by: user?.id
        }, {
          onConflict: 'mes,ano'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar saldo inicial:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao salvar saldo inicial:', error);
      return null;
    }
  },

  // Calcular fluxo de caixa do mês
  async getFluxoCaixa(mes: number, ano: number): Promise<FluxoCaixa | null> {
    return this.getFluxoCaixaPorPeriodo(mes, ano);
  },

  // Calcular fluxo de caixa por período específico
  async getFluxoCaixaPorPeriodo(mes?: number, ano?: number, dataInicio?: string, dataFim?: string): Promise<FluxoCaixa | null> {
    try {
      console.log(`[FLUXO CAIXA] Calculando para ${dataInicio ? `${dataInicio} a ${dataFim}` : `${mes}/${ano}`}`);
      
      // Buscar saldo inicial (usar mês/ano se disponível, senão usar mês atual)
      const mesParaSaldo = mes || new Date().getMonth() + 1;
      const anoParaSaldo = ano || new Date().getFullYear();
      const saldoInicial = await this.getSaldoInicial(mesParaSaldo, anoParaSaldo);
      const saldoInicialValor = saldoInicial?.saldo_inicial || 0;
      console.log(`[FLUXO CAIXA] Saldo inicial: ${saldoInicialValor}`);

      // Calcular período
      let dataInicioObj: Date;
      let dataFimObj: Date;
      
      if (dataInicio && dataFim) {
        // Usar datas específicas
        dataInicioObj = new Date(dataInicio);
        dataFimObj = new Date(dataFim);
      } else if (mes && ano) {
        // Usar mês/ano
        dataInicioObj = new Date(ano, mes - 1, 1);
        dataFimObj = new Date(ano, mes, 0);
      } else {
        // Usar mês atual
        const hoje = new Date();
        dataInicioObj = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFimObj = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      }
      
      console.log(`[FLUXO CAIXA] Período: ${dataInicioObj.toISOString().split('T')[0]} a ${dataFimObj.toISOString().split('T')[0]}`);

      // Buscar lançamentos do período com timeout
      console.log('[FLUXO CAIXA] Buscando lançamentos...');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Query demorou mais de 10 segundos')), 10000)
      );
      
      const lancamentosPromise = supabase
        .from('lancamentos')
        .select('valor_atendimento, valor_pago, troco, valor_empresa, repasse_valor')
        .gte('data', dataInicioObj.toISOString().split('T')[0])
        .lte('data', dataFimObj.toISOString().split('T')[0]);

      const { data: lancamentos, error: lancamentosError } = await Promise.race([lancamentosPromise, timeoutPromise]) as any;
      console.log(`[FLUXO CAIXA] Lançamentos concluídos. Erro: ${lancamentosError?.message || 'null'}`);

      // Buscar aportes do período com timeout
      console.log('[FLUXO CAIXA] Buscando aportes...');
      const aportesPromise = supabase
        .from('aportes_caixa')
        .select('valor')
        .gte('data', dataInicioObj.toISOString().split('T')[0])
        .lte('data', dataFimObj.toISOString().split('T')[0]);

      const { data: aportes, error: aportesError } = await Promise.race([aportesPromise, timeoutPromise]) as any;
      console.log(`[FLUXO CAIXA] Aportes concluídos. Erro: ${aportesError?.message || 'null'}`);

      if (lancamentosError) {
        console.error('[FLUXO CAIXA] Erro ao buscar lançamentos:', lancamentosError);
      }
      if (aportesError) {
        console.error('[FLUXO CAIXA] Erro ao buscar aportes:', aportesError);
      }

      console.log(`[FLUXO CAIXA] Encontrados ${lancamentos?.length || 0} lançamentos e ${aportes?.length || 0} aportes`);

      // Calcular totais
      let totalEntradas = 0;
      let totalSaidas = 0;
      let totalRepasses = 0;
      let totalTrocos = 0;
      let totalAportesEntrada = 0;
      let totalAportesSaida = 0;

      lancamentos?.forEach(lancamento => {
        // Entradas: repasse para LYB (parte da empresa)
        totalEntradas += lancamento.repasse_valor || 0;
        
        // Saídas: apenas os trocos (dinheiro que sai do caixa)
        totalTrocos += lancamento.troco || 0;
      });

      // Processar aportes (positivos = entrada, negativos = saída)
      aportes?.forEach(aporte => {
        if (aporte.valor >= 0) {
          totalAportesEntrada += aporte.valor || 0;
        } else {
          totalAportesSaida += Math.abs(aporte.valor || 0);
        }
      });

      totalEntradas += totalAportesEntrada;
      totalSaidas = totalTrocos + totalAportesSaida;
      const saldoAtual = saldoInicialValor + totalEntradas - totalSaidas;

      console.log(`[FLUXO CAIXA] Totais: Entradas=${totalEntradas} (Lancamentos=${totalEntradas - totalAportesEntrada}, Aportes=${totalAportesEntrada}), Saídas=${totalSaidas} (Trocos=${totalTrocos}, Retiradas=${totalAportesSaida}), Saldo=${saldoAtual}`);

      return {
        saldo_inicial: saldoInicialValor,
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        saldo_atual: saldoAtual,
        detalhes: {
          entradas: {
            lancamentos: totalEntradas - totalAportesEntrada,
            outros: totalAportesEntrada // Aportes vão em "outros"
          },
          saidas: {
            repasses_profissionais: 0, // Não são saídas do caixa
            trocos: totalTrocos,
            outros: totalAportesSaida // Retiradas vão em "outros"
          }
        }
      };
    } catch (error) {
      console.error('[FLUXO CAIXA] Erro ao calcular fluxo de caixa:', error);
      // Retornar fluxo vazio em caso de erro
      return {
        saldo_inicial: 0,
        total_entradas: 0,
        total_saidas: 0,
        saldo_atual: 0,
        detalhes: {
          entradas: {
            lancamentos: 0,
            outros: 0
          },
          saidas: {
            repasses_profissionais: 0,
            trocos: 0,
            outros: 0
          }
        }
      };
    }
  },

  // Listar histórico de saldos iniciais
  async getHistoricoSaldoInicial(): Promise<SaldoInicial[]> {
    const { data, error } = await supabase
      .from('saldo_inicial')
      .select('*')
      .order('ano', { ascending: false })
      .order('mes', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    // Buscar nomes dos usuários separadamente
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(item => item.created_by))];
      const { data: usuarios, error: usuariosError } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('id', userIds);

      if (!usuariosError && usuarios) {
        // Mapear nomes dos usuários
        const usuariosMap = new Map(usuarios.map(u => [u.id, u.nome]));
        return data.map(item => ({
          ...item,
          usuario: {
            nome: usuariosMap.get(item.created_by) || 'Usuário não encontrado'
          }
        }));
      }
    }

    return data || [];
  },

  // Atualizar saldo inicial existente
  async updateSaldoInicial(id: number, input: SaldoInicialInput): Promise<SaldoInicial | null> {
    try {
      const { data, error } = await supabase
        .from('saldo_inicial')
        .update({
          mes: input.mes,
          ano: input.ano,
          saldo_inicial: input.saldo_inicial,
          tipo_saldo: input.tipo_saldo,
          observacoes: input.observacoes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar saldo inicial:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar saldo inicial:', error);
      return null;
    }
  },

  // Excluir saldo inicial
  async deleteSaldoInicial(id: number): Promise<boolean> {
    try {
      console.log('[DEBUG] Tentando excluir saldo_inicial id:', id);
      const { error } = await supabase
        .from('saldo_inicial')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[DEBUG] Erro ao excluir saldo inicial:', error);
        return false;
      }

      console.log('[DEBUG] Saldo inicial excluído com sucesso');
      return true;
    } catch (error) {
      console.error('[DEBUG] Erro ao excluir saldo inicial:', error);
      return false;
    }
  }
};
