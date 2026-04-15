import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Lancamento {
  id: string;
  data: string;
  profissional: string;
  valor_atendimento: number;
  valor_empresa: number;
  repasse_valor: number;
  forma_pagamento: string;
  descricao?: string;
  troco?: number;
}

interface ProfissionalEarnings {
  profissional: string;
  total_earnings: number;
  total_sessions: number;
  payment_methods: { [key: string]: number };
  lancamentos: Lancamento[];
}

interface ProfissionaisReportProps {
  onBack: () => void;
}

export const ProfissionaisReportSimple: React.FC<ProfissionaisReportProps> = ({ onBack }) => {
  console.log("[PROFISSIONAIS_REPORT] Relatório de profissionais iniciado");

  const [profissionaisData, setProfissionaisData] = useState<ProfissionalEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProfissionaisData = async () => {
    if (dataLoaded) {
      console.log("[PROFISSIONAIS_REPORT] Dados já carregados, pulando...");
      return;
    }

    try {
      setLoading(true);
      console.log("[PROFISSIONAIS_REPORT] Carregando dados do Supabase...");

      // Carregar lançamentos
      const { data: lancamentosData, error: lancamentosError } = await supabase
        .from('lancamentos')
        .select('*')
        .order('data', { ascending: false });

      if (lancamentosError) {
        console.error("[PROFISSIONAIS_REPORT] Erro ao carregar lançamentos:", lancamentosError);
        return;
      }

      console.log("[PROFISSIONAIS_REPORT] Lançamentos carregados:", lancamentosData?.length || 0);

      // Processar dados por profissional
      const profissionaisMap = new Map<string, ProfissionalEarnings>();

      lancamentosData?.forEach(lancamento => {
        const profissional = lancamento.profissional;
        
        if (!profissionaisMap.has(profissional)) {
          profissionaisMap.set(profissional, {
            profissional,
            total_earnings: 0,
            total_sessions: 0,
            payment_methods: {},
            lancamentos: []
          });
        }

        const earnings = profissionaisMap.get(profissional)!;
        
        // Calcular valor correto do profissional
        const valorEmpresaCorreto = lancamento.valor_empresa > 0 
          ? lancamento.valor_empresa 
          : (lancamento.valor_atendimento - lancamento.repasse_valor);

        earnings.total_earnings += valorEmpresaCorreto;
        earnings.total_sessions += 1;
        
        // Contar por forma de pagamento
        const formaPagamento = lancamento.forma_pagamento;
        earnings.payment_methods[formaPagamento] = (earnings.payment_methods[formaPagamento] || 0) + valorEmpresaCorreto;
        
        // Adicionar lançamento
        earnings.lancamentos.push({
          ...lancamento,
          valor_empresa: valorEmpresaCorreto
        });
      });

      const profissionaisArray = Array.from(profissionaisMap.values());
      console.log("[PROFISSIONAIS_REPORT] Profissionais processados:", profissionaisArray.length);
      
      setProfissionaisData(profissionaisArray);
      setDataLoaded(true);
    } catch (error) {
      console.error("[PROFISSIONAIS_REPORT] Erro geral:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log("[PROFISSIONAIS_REPORT] Forçando refresh...");
    setDataLoaded(false);
    setRefreshKey(prev => prev + 1);
    loadProfissionaisData();
  };

  useEffect(() => {
    loadProfissionaisData();
  }, [refreshKey]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '18px' }}>Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>👩‍💼 Relatório de Profissionais</h1>
          <p style={{ margin: '5px 0 0 0' }}>Análise detalhada por profissional - {profissionaisData.length} profissionais</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Atualizar
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Voltar
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Total Profissionais</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{profissionaisData.length}</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Total Sessões</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {profissionaisData.reduce((sum, p) => sum + p.total_sessions, 0)}
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>Faturamento Total</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {formatCurrency(profissionaisData.reduce((sum, p) => sum + p.total_earnings, 0))}
            </p>
          </div>
        </div>

        {/* Profissionais List */}
        {profissionaisData.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ fontSize: '18px', margin: 0 }}>Nenhum profissional encontrado</p>
          </div>
        ) : (
          profissionaisData.map((profissional, index) => (
            <div key={profissional.profissional} style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px',
              overflow: 'hidden'
            }}>
              {/* Profissional Header */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderBottom: '1px solid #dee2e6'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{profissional.profissional}</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      {profissional.total_sessions} sessões • {formatCurrency(profissional.total_earnings)} faturado
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {Object.entries(profissional.payment_methods).map(([forma, valor]) => (
                      <div key={forma} style={{
                        backgroundColor: '#e9ecef',
                        padding: '8px 12px',
                        borderRadius: '5px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>{forma}</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                          {formatCurrency(valor)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lançamentos Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Data</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Descrição</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Valor Atend.</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Valor Prof.</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Repasse</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Pagamento</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Troco</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profissional.lancamentos.map((lancamento, lancIndex) => (
                      <tr key={lancamento.id} style={{
                        backgroundColor: lancIndex % 2 === 0 ? 'white' : '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        <td style={{ padding: '12px' }}>{formatDate(lancamento.data)}</td>
                        <td style={{ padding: '12px' }}>{lancamento.descricao || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#007bff' }}>
                          {formatCurrency(lancamento.valor_atendimento)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                          {formatCurrency(lancamento.valor_empresa)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>
                          {formatCurrency(lancamento.repasse_valor)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: '#e9ecef',
                            color: '#495057'
                          }}>
                            {lancamento.forma_pagamento}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#6c757d' }}>
                          {lancamento.troco ? formatCurrency(lancamento.troco) : '-'}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                      <td style={{ padding: '12px' }}>TOTAL</td>
                      <td style={{ padding: '12px' }}>-</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#007bff' }}>
                        {formatCurrency(profissional.lancamentos.reduce((sum, l) => sum + l.valor_atendimento, 0))}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#28a745' }}>
                        {formatCurrency(profissional.lancamentos.reduce((sum, l) => sum + l.valor_empresa, 0))}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#dc3545' }}>
                        {formatCurrency(profissional.lancamentos.reduce((sum, l) => sum + l.repasse_valor, 0))}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>-</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#6c757d' }}>
                        {formatCurrency(profissional.lancamentos.reduce((sum, l) => sum + (l.troco || 0), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
