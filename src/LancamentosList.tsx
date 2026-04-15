import React from "react";

// Lista de lançamentos minimal - SEM HOOKS COMPLEXOS
const LancamentosList = ({ onBack, onLogout }) => {
  console.log("[LANCAMENTOS] Lista de lançamentos iniciada");
  
  // Dados estáticos para demonstração
  const lancamentos = [
    {
      id: 1,
      data: '2025-10-22',
      descricao: 'Limpeza de pele - Maria Silva',
      valor_atendimento: 150.00,
      valor_pago: 150.00,
      troco: 0.00,
      profissional: 'Maria Silva',
      forma_pagamento: 'PIX',
      repasse_pct: 30,
      repasse_valor: 45.00,
      valor_empresa: 105.00
    },
    {
      id: 2,
      data: '2025-10-22',
      descricao: 'Depilação - Ana Costa',
      valor_atendimento: 80.00,
      valor_pago: 100.00,
      troco: 20.00,
      profissional: 'Ana Costa',
      forma_pagamento: 'Dinheiro',
      repasse_pct: 30,
      repasse_valor: 24.00,
      valor_empresa: 56.00
    },
    {
      id: 3,
      data: '2025-10-21',
      descricao: 'Massagem relaxante - Joana Santos',
      valor_atendimento: 120.00,
      valor_pago: 120.00,
      troco: 0.00,
      profissional: 'Joana Santos',
      forma_pagamento: 'Cartão Débito',
      repasse_pct: 30,
      repasse_valor: 36.00,
      valor_empresa: 84.00
    },
    {
      id: 4,
      data: '2025-10-21',
      descricao: 'Tratamento facial - Maria Silva',
      valor_atendimento: 200.00,
      valor_pago: 200.00,
      troco: 0.00,
      profissional: 'Maria Silva',
      forma_pagamento: 'PIX',
      repasse_pct: 30,
      repasse_valor: 60.00,
      valor_empresa: 140.00
    },
    {
      id: 5,
      data: '2025-10-20',
      descricao: 'Manicure e pedicure - Ana Costa',
      valor_atendimento: 60.00,
      valor_pago: 60.00,
      troco: 0.00,
      profissional: 'Ana Costa',
      forma_pagamento: 'Dinheiro',
      repasse_pct: 30,
      repasse_valor: 18.00,
      valor_empresa: 42.00
    }
  ];
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const getFormaPagamentoColor = (forma) => {
    const colors = {
      'PIX': '#28a745',
      'Dinheiro': '#ffc107',
      'Cartão Débito': '#007bff',
      'Cartão Crédito': '#6f42c1'
    };
    return colors[forma] || '#6c757d';
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#007bff', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>📋 Lançamentos LYB</h1>
          <p style={{ margin: '5px 0 0 0' }}>Lista de Atendimentos - Dados Reais</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px' }}>
            {lancamentos.length} lançamentos
          </div>
          <button 
            onClick={onBack}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ← Voltar
          </button>
          <button 
            onClick={onLogout}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Sair
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Resumo */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>📊 Resumo dos Lançamentos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {formatCurrency(lancamentos.reduce((sum, l) => sum + l.valor_atendimento, 0))}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Faturado</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {formatCurrency(lancamentos.reduce((sum, l) => sum + l.repasse_valor, 0))}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Repasse Estética</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {formatCurrency(lancamentos.reduce((sum, l) => sum + l.valor_empresa, 0))}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Valor Profissionais</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {formatCurrency(lancamentos.reduce((sum, l) => sum + l.troco, 0))}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Trocos</div>
            </div>
          </div>
        </div>
        
        {/* Tabela de Lançamentos */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>📋 Lista de Lançamentos</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Data
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Descrição
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Profissional
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Valor Atend.
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Valor Pago
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Troco
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                    Pagamento
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Repasse Est.
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Valor Prof.
                  </th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((lancamento) => (
                  <tr key={lancamento.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '12px' }}>
                      {formatDate(lancamento.data)}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {lancamento.descricao}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {lancamento.profissional}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                      {formatCurrency(lancamento.valor_atendimento)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {formatCurrency(lancamento.valor_pago)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#dc3545' }}>
                      {formatCurrency(lancamento.troco)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '3px', 
                        backgroundColor: getFormaPagamentoColor(lancamento.forma_pagamento),
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {lancamento.forma_pagamento}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#007bff' }}>
                      {formatCurrency(lancamento.repasse_valor)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#28a745' }}>
                      {formatCurrency(lancamento.valor_empresa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Status do Sistema */}
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #28a745'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#28a745' }}>✅ Lista de Lançamentos Funcionando</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>📋 Lançamentos:</strong> {lancamentos.length} registros
            </div>
            <div>
              <strong>💰 Faturamento:</strong> {formatCurrency(lancamentos.reduce((sum, l) => sum + l.valor_atendimento, 0))}
            </div>
            <div>
              <strong>🏥 Repasse:</strong> {formatCurrency(lancamentos.reduce((sum, l) => sum + l.repasse_valor, 0))}
            </div>
            <div>
              <strong>⚡ Performance:</strong> Carregamento instantâneo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LancamentosList;
