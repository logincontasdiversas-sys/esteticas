import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const handler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { email, nome, role, origin, organization_id } = await req.json();
    
    console.log(`📧 Convite de usuário para ${email}: ${nome} (${role}) na organização ${organization_id} na origem ${origin}`);
    
    // PRIORIDADE: Origem enviada pelo frontend > Secret APP_URL > Default
    const appUrl = origin || Deno.env.get('APP_URL') || 'http://localhost:8081';
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')

    if (!appUrl || !serviceRoleKey) {
      console.error('❌ Faltam segredos (secrets): APP_URL ou SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({
        error: 'Configuração incompleta no Supabase. Verifique os Secrets (APP_URL e SERVICE_ROLE_KEY).'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // USAR A URL INTERNA DO SUPABASE (Diferente da APP_URL do frontend)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    
    // Create Supabase client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Invite user with magic link to password setup page
    console.log('📧 Disparando convite por email...');
    const { data: userData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${appUrl}/set-password`,
        data: { 
          nome: nome,
          role: role,
          organization_id: organization_id,
          organization_name: origin?.includes('lyb') ? 'LYB Estética' : 'Lumina Control'
        }
      }
    );

    if (inviteError || !userData.user) {
      if (inviteError?.message?.includes('already invited') || inviteError?.message?.includes('already exists')) {
        console.warn('⚠️ Usuário já existe, ignorando erro de convite e tentando sincronizar dados...');
        // Em caso de usuário existente, o Auth não nos devolve o User por segurança.
        // O banco de dados (Triggers) cuidará de vincular pelo e-mail se necessário.
        return new Response(JSON.stringify({
          success: true,
          message: 'Usuário já convidado. Perfil será atualizado.',
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } else {
        console.error('❌ Erro no convite Auth:', inviteError);
        return new Response(JSON.stringify({
          error: inviteError?.message || 'Falha ao enviar convite por email.'
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    console.log('✅ User invited in Auth:', userData.user.id);

    // SINCRONIZAÇÃO OBRIGATÓRIA (Omega Stability v5.0 - BLOCKING)
    try {
      console.log('👤 Criando Perfil no Banco de Dados...');
      // Estrutura validada: id, nome, email, organization_id
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: userData.user.id,
        nome: nome,
        email: email,
        organization_id: organization_id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (profileError) {
        console.error('❌ Falha ao criar perfil:', profileError.message);
        throw new Error(`Erro no perfil: ${profileError.message}`);
      }

      console.log('🛡️ Criando Cargo no Banco de Dados...');
      // Estrutura validada: user_id, role
      const { error: roleError } = await supabaseAdmin.from('user_roles').upsert({
        user_id: userData.user.id,
        role: role
      }, { onConflict: 'user_id,role' });

      if (roleError) {
        console.error('❌ Falha ao criar cargo:', roleError.message);
        throw new Error(`Erro no cargo: ${roleError.message}`);
      }

      console.log('✅ Perfil e Cargo sincronizados com sucesso.');
    } catch (syncError) {
      console.error('💥 ERRO CRÍTICO NA SINCRONIZAÇÃO:', syncError.message);
      // Aqui poderíamos deletar o usuário convidado se a sincronia falhar, 
      // mas por segurança letal apenas reportamos o erro para o Admin corrigir.
      return new Response(JSON.stringify({
        success: false,
        error: `Convite enviado, mas houve erro no banco: ${syncError.message}`
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Convite enviado com sucesso!',
      user: {
        id: userData.user.id,
        email: email,
        nome: nome,
        role: role
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('💥 Erro Crítico na Edge Function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno catastrófico'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

serve(handler);
