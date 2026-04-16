-- Função para recalcular repasse_valor e valor_empresa de todos os lançamentos de um profissional
CREATE OR REPLACE FUNCTION recalcular_lancamentos_profissional(
  p_profissional_nome TEXT,
  p_novo_repasse_pct NUMERIC
)
RETURNS VOID AS $$
BEGIN
  UPDATE lancamentos
  SET 
    repasse_pct = p_novo_repasse_pct,
    repasse_valor = (valor_atendimento * p_novo_repasse_pct) / 100,
    valor_empresa = valor_atendimento - ((valor_atendimento * p_novo_repasse_pct) / 100)
  WHERE profissional = p_profissional_nome;
END;
$$ LANGUAGE plpgsql;

-- Conceder permissão de execução
GRANT EXECUTE ON FUNCTION recalcular_lancamentos_profissional TO authenticated;

