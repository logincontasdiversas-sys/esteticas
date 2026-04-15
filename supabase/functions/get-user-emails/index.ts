import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface GetUserEmailsRequest {
  user_ids: string[];
}

const handler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { user_ids } = await req.json();
    
    console.log(`📧 Buscando emails para ${user_ids.length} usuários`);
    
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

    // Get users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error getting auth users:', authError);
      throw authError;
    }

    // Filter users by requested IDs and extract emails
    const emails = authUsers.users
      .filter(user => user_ids.includes(user.id))
      .map(user => ({
        user_id: user.id,
        email: user.email
      }));

    console.log('✅ Emails retrieved successfully');
    
    return new Response(JSON.stringify({
      success: true,
      emails: emails
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
