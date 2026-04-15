import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface DeleteUserRequest {
  userId: string;
}

const handler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { userId } = await req.json();
    
    console.log(`🗑️ Deletando usuário: ${userId}`);
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('APP_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Delete from user_roles
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (roleError) {
      console.error('Error deleting role:', roleError);
      throw roleError;
    }

    // 2. Delete from profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw profileError;
    }

    // 3. Delete from auth.users (requires service role)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw authError;
    }

    console.log('✅ User deleted successfully from all tables');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Usuário deletado com sucesso!',
      userId: userId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(JSON.stringify({
      error: error.message
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
