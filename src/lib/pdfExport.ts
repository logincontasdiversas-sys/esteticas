/**
 * @file: pdfExport.ts
 * @responsibility: PDF export utilities for reports
 * @exports: exportarRelatorioPDF
 * @layer: lib
 */

export const exportarRelatorioPDF = (
  profissionaisComDados: any[],
  totais: {
    totalGeral: number;
    totalRepasseProf: number;
    totalRepasseLYB: number;
    totalTroco: number;
  },
  periodo: string
) => {
  // Criar conteúdo HTML para impressão
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Profissionais - LYB</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 1cm;
        }
        
        @media print {
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        
        /* Remover qualquer margem ou padding que possa criar espaço para data automática */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        body {
          padding: 20px !important;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #4A90E2;
          padding-bottom: 15px;
        }
        
        .header h1 {
          margin: 0;
          color: #4A90E2;
          font-size: 24px;
        }
        
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        
        .profissional-card {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .profissional-titulo {
          background-color: #f5f5f5;
          padding: 10px;
          border-left: 4px solid #4A90E2;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        table th {
          background-color: #4A90E2;
          color: white;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
        }
        
        table th.center {
          text-align: center;
        }
        
        table th.right {
          text-align: right;
        }
        
        table td {
          padding: 6px 8px;
          border-bottom: 1px solid #ddd;
          font-size: 11px;
        }
        
        table td.center {
          text-align: center;
        }
        
        table td.right {
          text-align: right;
        }
        
        table tbody tr:hover {
          background-color: #f9f9f9;
        }
        
        .total-row {
          background-color: #f0f0f0 !important;
          font-weight: bold;
          border-top: 2px solid #4A90E2;
        }
        
        .detalhes-lancamentos {
          margin-top: 10px;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f9f9f9;
          border-left: 3px solid #4A90E2;
        }
        
        .detalhes-lancamentos h4 {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #666;
          font-weight: bold;
        }
        
        .detalhes-table {
          font-size: 10px;
        }
        
        .detalhes-table th {
          background-color: #6B7280;
          font-size: 10px;
          padding: 5px;
        }
        
        .detalhes-table td {
          padding: 4px 5px;
          font-size: 10px;
        }
        
        .total-geral {
          margin-top: 30px;
          padding: 20px;
          background-color: #e8f4f8;
          border: 3px solid #4A90E2;
          page-break-inside: avoid;
        }
        
        .total-geral h2 {
          margin: 0 0 15px 0;
          color: #4A90E2;
          text-align: center;
        }
        
        .totais-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .total-item {
          text-align: center;
        }
        
        .total-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .total-valor {
          font-size: 18px;
          font-weight: bold;
        }
        
        .total-valor.blue { color: #2563eb; }
        .total-valor.green { color: #16a34a; }
        .total-valor.yellow { color: #ca8a04; }
        .total-valor.orange { color: #ea580c; }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #999;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .profissional-card {
            page-break-inside: avoid;
          }
          
          .total-geral {
            page-break-before: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 LYB Controle Financeiro</h1>
        <p>Relatório de Profissionais - ${periodo}</p>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
  `;

  // Adicionar cada profissional
  profissionaisComDados.forEach(prof => {
    htmlContent += `
      <div class="profissional-card">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <h2 style="margin: 0; color: #4A90E2; font-size: 20px; font-weight: bold;">
            ${prof.nome}
          </h2>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
            ${prof.quantidadeTotal} atendimentos
          </p>
        </div>
        <div class="profissional-titulo" style="display: none;">
          ${prof.nome} (${prof.quantidadeTotal} atendimentos)
        </div>
        <table>
          <thead>
            <tr>
              <th>Forma Pagamento</th>
              <th class="center">Qtd.</th>
              <th class="right">Valor Total</th>
              <th class="right">Repasse Prof. (${100 - prof.repasse_pct}%)</th>
              <th class="right">Repasse LYB (${prof.repasse_pct}%)</th>
              <th class="right">Troco</th>
            </tr>
          </thead>
          <tbody>
    `;

    prof.porForma.forEach((forma: any) => {
      if (forma.quantidade > 0) {
        htmlContent += `
          <tr>
            <td><strong>${forma.forma}</strong></td>
            <td class="center">${forma.quantidade}</td>
            <td class="right">${formatCurrency(forma.valorTotal)}</td>
            <td class="right">${formatCurrency(forma.repasseProf)}</td>
            <td class="right">${formatCurrency(forma.repasseLYB)}</td>
            <td class="right">${formatCurrency(forma.troco)}</td>
          </tr>
        `;
      }
    });

    htmlContent += `
            <tr class="total-row">
              <td><strong>TOTAL</strong></td>
              <td class="center"><strong>${prof.quantidadeTotal}</strong></td>
              <td class="right"><strong>${formatCurrency(prof.totalGeral)}</strong></td>
              <td class="right"><strong>${formatCurrency(prof.totalRepasseProf)}</strong></td>
              <td class="right"><strong>${formatCurrency(prof.totalRepasseLYB)}</strong></td>
              <td class="right"><strong>${formatCurrency(prof.totalTroco)}</strong></td>
            </tr>
          </tbody>
        </table>
    `;
    
    // Adicionar detalhes dos lançamentos por forma de pagamento
    prof.porForma.forEach((forma: any) => {
      if (forma.quantidade > 0 && forma.lancamentos && forma.lancamentos.length > 0) {
        const formatDatePDF = (dateString: string) => {
          const [year, month, day] = dateString.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return date.toLocaleDateString('pt-BR');
        };
        
        htmlContent += `
        <div class="detalhes-lancamentos">
          <h4>📋 Atendimentos - ${forma.forma} (${forma.lancamentos.length})</h4>
          <table class="detalhes-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th class="right">Valor Atendimento</th>
                <th class="right">Valor Pago</th>
                <th class="right">Troco</th>
                <th class="right">Repasse Prof.</th>
                <th class="right">Repasse LYB</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        // Ordenar lançamentos por data (mais recente primeiro)
        const lancamentosOrdenados = [...forma.lancamentos].sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        
        lancamentosOrdenados.forEach((lancamento: any) => {
          htmlContent += `
            <tr>
              <td>${formatDatePDF(lancamento.data)}</td>
              <td>${lancamento.descricao || '-'}</td>
              <td class="right">${formatCurrency(lancamento.valor_atendimento)}</td>
              <td class="right">${formatCurrency(lancamento.valor_pago || 0)}</td>
              <td class="right">${formatCurrency(lancamento.troco || 0)}</td>
              <td class="right">${formatCurrency(lancamento.valor_empresa || 0)}</td>
              <td class="right">${formatCurrency(lancamento.repasse_valor || 0)}</td>
            </tr>
          `;
        });
        
        htmlContent += `
            </tbody>
          </table>
        </div>
        `;
      }
    });
    
    htmlContent += `
      </div>
    `;
  });

  // Totais gerais
  htmlContent += `
    <div class="total-geral">
      <h2>📊 TOTAIS GERAIS</h2>
      <div class="totais-grid">
        <div class="total-item">
          <div class="total-label">Faturamento Total</div>
          <div class="total-valor blue">${formatCurrency(totais.totalGeral)}</div>
        </div>
        <div class="total-item">
          <div class="total-label">Total Profissionais</div>
          <div class="total-valor green">${formatCurrency(totais.totalRepasseProf)}</div>
        </div>
        <div class="total-item">
          <div class="total-label">Total LYB</div>
          <div class="total-valor yellow">${formatCurrency(totais.totalRepasseLYB)}</div>
        </div>
        <div class="total-item">
          <div class="total-label">Total Trocos</div>
          <div class="total-valor orange">${formatCurrency(totais.totalTroco)}</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Relatório gerado automaticamente pelo sistema LYB Controle Financeiro</p>
    </div>
  `;

  htmlContent += `
    </body>
    </html>
  `;

  // Abrir em nova janela para impressão
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar carregar e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        // Adicionar estilos para melhorar impressão
        const style = printWindow.document.createElement('style');
        style.textContent = `
          @page {
            margin: 1cm !important;
            size: A4 portrait;
          }
          @media print {
            @page {
              margin: 1cm !important;
            }
          }
        `;
        printWindow.document.head.appendChild(style);
        
        // Mostrar instruções antes de imprimir (remover cabeçalhos automáticos)
        const instrucoes = printWindow.document.createElement('div');
        instrucoes.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #ff9800; color: white; padding: 10px 20px; border-radius: 5px; z-index: 9999; font-size: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);';
        instrucoes.innerHTML = '💡 <strong>Dica:</strong> Nas opções de impressão, desmarque "Cabeçalhos e rodapés" para remover a data do canto superior';
        printWindow.document.body.prepend(instrucoes);
        
        // Remover instruções após 3 segundos
        setTimeout(() => {
          instrucoes.remove();
          printWindow.print();
        }, 3000);
      }, 250);
    };
  } else {
    throw new Error('Não foi possível abrir janela de impressão. Verifique se pop-ups estão bloqueados.');
  }
};
