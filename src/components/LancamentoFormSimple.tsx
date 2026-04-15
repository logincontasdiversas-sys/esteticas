import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Profissional {
  id: string;
  nome: string;
  repasse_pct: number;
  ativo: boolean;
}

interface LancamentoFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const LancamentoFormSimple: React.FC<LancamentoFormProps> = ({ onBack, onSuccess }) => {
  const { organizationId, user } = useAuth();
  console.log("[LANCAMENTO_FORM] Formulário de lançamentos iniciado");

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0], // Today's date
    profissional: '',
    valor_atendimento: '',
    forma_pagamento: 'PIX',
    descricao: '',
    troco: ''
  });

  const loadProfissionais = async () => {
    try {
      setLoading(true);
      console.log("[LANCAMENTO_FORM] Carregando profissionais...");

      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error("[LANCAMENTO_FORM] Erro ao carregar profissionais:", error);
        setMessage(`Erro ao carregar profissionais: ${error.message}`);
        return;
      }

      console.log("[LANCAMENTO_FORM] Profissionais carregados:", data?.length || 0);
      setProfissionais(data || []);
    } catch (error) {
      console.error("[LANCAMENTO_FORM] Erro geral:", error);
      setMessage("Erro ao carregar profissionais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfissionais();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.profissional || !formData.valor_atendimento) {
      setMessage("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      // Find selected professional
      const profissional = profissionais.find(p => p.id === formData.profissional);
      if (!profissional) {
        setMessage("Profissional não encontrado");
        return;
      }

      const valorAtendimento = parseFloat(formData.valor_atendimento);
      const troco = parseFloat(formData.troco) || 0;

      // Calculate repasse and valor_empresa
      const repasse_valor = (valorAtendimento * profissional.repasse_pct) / 100;
      const valor_empresa = valorAtendimento - repasse_valor;

      console.log("[LANCAMENTO_FORM] Criando lançamento:", {
        profissional: profissional.nome,
        valor_atendimento: valorAtendimento,
        repasse_pct: profissional.repasse_pct,
        repasse_valor,
        valor_empresa
      });

      const { data, error } = await supabase
        .from('lancamentos')
        .insert({
          data: formData.data,
          profissional: profissional.nome,
          valor_atendimento: valorAtendimento,
          valor_pago: valorAtendimento, // Campo obrigatório - mesmo valor do atendimento
          valor_empresa: valor_empresa,
          repasse_valor: repasse_valor,
          repasse_pct: profissional.repasse_pct,
          forma_pagamento: formData.forma_pagamento,
          descricao: formData.descricao || null,
          troco: troco > 0 ? troco : null,
          organization_id: organizationId,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) {
        console.error("[LANCAMENTO_FORM] Erro ao criar lançamento:", error);
        setMessage(`Erro ao criar lançamento: ${error.message}`);
        return;
      }

      console.log("[LANCAMENTO_FORM] Lançamento criado com sucesso:", data);
      setMessage("✅ Lançamento criado com sucesso!");
      
      // Reset form
      setFormData({
        data: new Date().toISOString().split('T')[0],
        profissional: '',
        valor_atendimento: '',
        forma_pagamento: 'PIX',
        descricao: '',
        troco: ''
      });

      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

    } catch (error) {
      console.error("[LANCAMENTO_FORM] Erro inesperado:", error);
      setMessage("Erro inesperado ao criar lançamento");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <p style={{ color: '#666', fontSize: '18px' }}>Carregando profissionais...</p>
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
          <h1 style={{ margin: 0 }}>➕ Novo Lançamento</h1>
          <p style={{ margin: '5px 0 0 0' }}>Criar novo lançamento financeiro</p>
        </div>
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

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Data */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Data *
              </label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Profissional */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Profissional *
              </label>
              <select
                name="profissional"
                value={formData.profissional}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome} ({prof.repasse_pct}% repasse)
                  </option>
                ))}
              </select>
            </div>

            {/* Valor do Atendimento */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Valor do Atendimento (R$) *
              </label>
              <input
                type="number"
                name="valor_atendimento"
                value={formData.valor_atendimento}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Forma de Pagamento *
              </label>
              <select
                name="forma_pagamento"
                value={formData.forma_pagamento}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              >
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
              </select>
            </div>

            {/* Troco */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Troco (R$) - Opcional
              </label>
              <input
                type="number"
                name="troco"
                value={formData.troco}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0,00"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Descrição */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Descrição - Opcional
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                placeholder="Ex: Depilação completa, limpeza facial..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Preview do Cálculo */}
            {formData.profissional && formData.valor_atendimento && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '5px',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>📊 Prévia do Cálculo</h4>
                {(() => {
                  const profissional = profissionais.find(p => p.id === formData.profissional);
                  const valor = parseFloat(formData.valor_atendimento);
                  if (profissional && valor) {
                    const repasse = (valor * profissional.repasse_pct) / 100;
                    const valorProf = valor - repasse;
                    return (
                      <div style={{ fontSize: '14px' }}>
                        <p style={{ margin: '5px 0' }}>
                          <strong>Valor Total:</strong> {formatCurrency(valor)}
                        </p>
                        <p style={{ margin: '5px 0', color: '#dc3545' }}>
                          <strong>Repasse Estética ({profissional.repasse_pct}%):</strong> {formatCurrency(repasse)}
                        </p>
                        <p style={{ margin: '5px 0', color: '#28a745' }}>
                          <strong>Valor Profissional:</strong> {formatCurrency(valorProf)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Message */}
            {message && (
              <div style={{
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                color: message.includes('✅') ? '#155724' : '#721c24',
                border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 24px',
                backgroundColor: submitting ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? '⏳ Criando...' : '✅ Criar Lançamento'}
            </button>
          </form>
        </div>
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
