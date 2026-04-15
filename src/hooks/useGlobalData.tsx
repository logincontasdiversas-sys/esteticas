import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GlobalDataContextType {
  lancamentos: any[];
  profissionais: any[];
  fluxoCaixa: any;
  loading: boolean;
  refreshData: (skipFluxoCaixa?: boolean) => Promise<void>;
}

const GlobalDataContext = createContext<GlobalDataContextType>({
  lancamentos: [],
  profissionais: [],
  fluxoCaixa: null,
  loading: true,
  refreshData: async () => {},
});

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within GlobalDataProvider');
  }
  return context;
};

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, organizationId } = useAuth();
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [fluxoCaixa, setFluxoCaixa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchData = async (skipFluxoCaixa = false) => {
    if (fetchingRef.current) {
      console.log('[GLOBAL DATA] Fetch já em andamento, pulando...');
      return;
    }
    
    fetchingRef.current = true;
    
    if (!user || !organizationId) {
      console.log('[GLOBAL DATA] Sem usuário ou organização, pulando fetch');
      setLoading(false);
      fetchingRef.current = false;
      return;
    }

    try {
      const [lancamentosResult, profissionaisResult] = await Promise.all([
        supabase
          .from('lancamentos')
          .select('*')
          .eq('organization_id', organizationId)
          .order('data', { ascending: false })
          .limit(100),
        supabase
          .from('profissionais')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('ativo', true)
          .order('nome')
      ]);

      console.log('[GLOBAL DATA] Queries paralelas concluídas');

      if (lancamentosResult.error) {
        console.error('[GLOBAL DATA] Erro ao carregar lançamentos:', lancamentosResult.error);
        setLancamentos([]);
      } else {
        setLancamentos(lancamentosResult.data || []);
        console.log(`[GLOBAL DATA] ${lancamentosResult.data?.length || 0} lançamentos carregados`);
      }

      if (profissionaisResult.error) {
        console.error('[GLOBAL DATA] Erro ao carregar profissionais:', profissionaisResult.error);
        setProfissionais([]);
      } else {
        setProfissionais(profissionaisResult.data || []);
        console.log(`[GLOBAL DATA] ${profissionaisResult.data?.length || 0} profissionais carregados`);
      }

      // Calcular fluxo de caixa
      if (!skipFluxoCaixa) {
        try {
        const hoje = new Date();
        const mes = hoje.getMonth() + 1;
        const ano = hoje.getFullYear();
        
        // Buscar saldo inicial do primeiro mês registrado (sem .single() para evitar erro se vazio)
        const { data: saldos } = await supabase
          .from('saldo_inicial')
          .select('*')
          .eq('organization_id', organizationId)
          .order('ano', { ascending: true })
          .order('mes', { ascending: true })
          .limit(1);

        const primeiroSaldo = saldos && saldos.length > 0 ? saldos[0] : null;
        let saldoInicialValor = primeiroSaldo?.saldo_inicial || 0;
        
        // Calcular data inicial e final para query
        const dataInicioGeral = primeiroSaldo 
          ? new Date(primeiroSaldo.ano, primeiroSaldo.mes - 1, 1)
          : new Date(ano, mes - 1, 1); // Se não houver saldo, começar do primeiro dia do mês atual
        
        const dataFimAtual = new Date(ano, mes - 1, new Date(ano, mes, 0).getDate()); // Último dia do mês atual

        // Buscar TODOS os lançamentos e aportes desde o início até o final do mês atual
        const { data: todosLancamentos } = await supabase
          .from('lancamentos')
          .select('repasse_valor, troco')
          .eq('organization_id', organizationId)
          .gte('data', dataInicioGeral.toISOString().split('T')[0])
          .lte('data', dataFimAtual.toISOString().split('T')[0]);

        const { data: todosAportes } = await supabase
          .from('aportes_caixa')
          .select('valor')
          .eq('organization_id', organizationId)
          .gte('data', dataInicioGeral.toISOString().split('T')[0])
          .lte('data', dataFimAtual.toISOString().split('T')[0]);

        // Somar tudo: ENTRADAS = repasse_valor (LYB) + aportes positivos, SAÍDAS = trocos + aportes negativos
        todosLancamentos?.forEach(l => {
          saldoInicialValor += l.repasse_valor || 0; // Entrada: repasse para LYB
          saldoInicialValor -= l.troco || 0; // Saída: troco devolvido
        });

        todosAportes?.forEach(a => {
          saldoInicialValor += a.valor || 0; // Aportes positivos = entrada, negativos = saída
        });

        // Calcular totais APENAS do mês atual para display
        const dataInicio = new Date(ano, mes - 1, 1);
        const dataFim = new Date(ano, mes - 1, new Date(ano, mes, 0).getDate()); // Último dia do mês atual

        const { data: lancamentosMes } = await supabase
          .from('lancamentos')
          .select('valor_atendimento, valor_pago, troco, valor_empresa, repasse_valor')
          .eq('organization_id', organizationId)
          .gte('data', dataInicio.toISOString().split('T')[0])
          .lte('data', dataFim.toISOString().split('T')[0]);

        const { data: aportes } = await supabase
          .from('aportes_caixa')
          .select('valor')
          .eq('organization_id', organizationId)
          .gte('data', dataInicio.toISOString().split('T')[0])
          .lte('data', dataFim.toISOString().split('T')[0]);

        let totalEntradas = 0;
        let totalSaidas = 0;

        lancamentosMes?.forEach(l => {
          totalEntradas += l.repasse_valor || 0; // Entrada: repasse para LYB
          totalSaidas += l.troco || 0; // Saída: troco devolvido
        });

        aportes?.forEach(a => {
          if (a.valor >= 0) {
            totalEntradas += a.valor || 0;
          } else {
            totalSaidas += Math.abs(a.valor || 0);
          }
        });

        // saldoInicialValor já é o saldo acumulado desde o início até o final do mês atual
        // totalEntradas e totalSaidas são apenas do mês atual para display
        setFluxoCaixa({
          saldo_inicial: primeiroSaldo?.saldo_inicial || 0,
          total_entradas: totalEntradas,
          total_saidas: totalSaidas,
          saldo_atual: saldoInicialValor // Saldo atual = repasse_valor - trocos - retiradas + saldo_inicial
        });

        console.log('[GLOBAL DATA] Fluxo de caixa calculado');
        } catch (error) {
          console.error('[GLOBAL DATA] Erro ao calcular fluxo de caixa:', error);
        }
      }

      console.log('[GLOBAL DATA] ✅ Dados globais carregados com sucesso!');
    } catch (error) {
      console.error('[GLOBAL DATA] Erro ao carregar dados globais:', error);
      setLancamentos([]);
      setProfissionais([]);
      setFluxoCaixa(null);
    } finally {
      console.log('[GLOBAL DATA] Finalizando loading...');
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    console.log('[GLOBAL DATA] useEffect executado, user:', user?.email);
    
    let channel: any = null;

    if (user && organizationId) {
      fetchData();

      // Configurar Realtime
      console.log('[GLOBAL DATA] 🛰️ Iniciando assinatura Realtime para org:', organizationId);
      
      channel = supabase
        .channel('realtime-global-data')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'lancamentos' },
          (payload) => {
            if (payload.new && (payload.new as any).organization_id === organizationId) {
              console.log('[REALTIME] Lançamento alterado, recarregando...');
              fetchData();
            } else if (payload.old && (payload.old as any).organization_id === organizationId) {
              console.log('[REALTIME] Lançamento deletado, recarregando...');
              fetchData();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profissionais' },
          (payload) => {
            if (payload.new && (payload.new as any).organization_id === organizationId) {
              console.log('[REALTIME] Profissional alterado, recarregando...');
              fetchData();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'aportes_caixa' },
          (payload) => {
            if (payload.new && (payload.new as any).organization_id === organizationId) {
              console.log('[REALTIME] Aporte alterado, recarregando...');
              fetchData();
            }
          }
        )
        .subscribe();

    } else {
      console.log('[GLOBAL DATA] Sem usuário, limpando estado');
      setLancamentos([]);
      setProfissionais([]);
      setFluxoCaixa(null);
      setLoading(false);
      fetchingRef.current = false;
    }

    return () => {
      if (channel) {
        console.log('[GLOBAL DATA] 🔇 Removendo assinatura Realtime');
        supabase.removeChannel(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, organizationId]);

  return (
    <GlobalDataContext.Provider value={{ lancamentos, profissionais, fluxoCaixa, loading, refreshData: fetchData }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

