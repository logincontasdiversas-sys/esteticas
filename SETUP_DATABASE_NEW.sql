-- ==========================================
-- SETUP COMPLETO LYB CONTROLE FINANCEIRO V2.0
-- ==========================================

-- 1. TIPOS CUSTOMIZADOS
CREATE TYPE app_role AS ENUM ('secretaria', 'gestora', 'adm');

-- 2. TABELAS PRINCIPAIS
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE TABLE public.profissionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  repasse_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.lancamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  descricao VARCHAR(500),
  valor_atendimento DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL,
  troco DECIMAL(10,2) DEFAULT 0.00,
  profissional VARCHAR(255) NOT NULL,
  forma_pagamento VARCHAR(100) NOT NULL,
  repasse_pct DECIMAL(5,2) NOT NULL,
  repasse_valor DECIMAL(10,2) NOT NULL,
  valor_empresa DECIMAL(10,2) NOT NULL,
  perfil_registrado VARCHAR(255),
  email_registrado VARCHAR(255),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  formas_pagamento TEXT[] DEFAULT ARRAY['PIX', 'Cartão Débito', 'Cartão Crédito', 'Dinheiro'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para user_roles
CREATE POLICY "Users can view roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'adm'));

-- Políticas para profissionais
CREATE POLICY "Authenticated users can view profissionais" ON public.profissionais FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage profissionais" ON public.profissionais FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('adm', 'gestora')));

-- Políticas para lancamentos
CREATE POLICY "Users can view lancamentos" ON public.lancamentos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert lancamentos" ON public.lancamentos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update lancamentos" ON public.lancamentos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete lancamentos" ON public.lancamentos FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para configs
CREATE POLICY "Authenticated users can view configs" ON public.configs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage configs" ON public.configs FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'adm'));

-- Políticas para audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'adm'));

-- 4. GATILHOS (TRIGGERS) AUTOMÁTICOS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 1 THEN 'adm'::app_role
      ELSE COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'secretaria'::app_role)
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_profissionais BEFORE UPDATE ON public.profissionais FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_lancamentos BEFORE UPDATE ON public.lancamentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_configs BEFORE UPDATE ON public.configs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. DADOS INICIAIS (SEED)
INSERT INTO public.configs (formas_pagamento) VALUES (ARRAY['PIX', 'Cartão Débito', 'Cartão Crédito', 'Dinheiro']);
