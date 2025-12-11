import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[verify-premium] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // User client to verify the JWT
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Service role client to update premium status (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('[verify-premium] User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-premium] Processing request for user:', user.id);

    // Parse request body
    const body = await req.json();
    const { planId, transactionId, receipt } = body;

    if (!planId) {
      console.error('[verify-premium] Missing planId');
      return new Response(
        JSON.stringify({ error: 'Missing planId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In production, you would verify the receipt with Apple here:
    // 1. Send receipt to Apple's verifyReceipt endpoint
    // 2. Validate the response contains the expected product
    // 3. Check that the transaction hasn't been used before
    // 
    // For now, we require transactionId as a basic check
    // TODO: Implement full Apple receipt validation
    // See: https://developer.apple.com/documentation/storekit/in-app_purchase/validating_receipts_with_the_app_store
    
    if (!transactionId) {
      console.error('[verify-premium] Missing transactionId - cannot verify purchase');
      return new Response(
        JSON.stringify({ error: 'Purchase verification failed: missing transaction data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-premium] Verified purchase:', { planId, transactionId });

    // Calculate expiration based on plan
    let expiresAt: Date | null = null;
    const now = new Date();
    
    switch (planId) {
      case 'monthly':
        expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        break;
      case 'annual':
        expiresAt = new Date(now);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        break;
      case 'lifetime':
        // No expiration for lifetime
        expiresAt = null;
        break;
      default:
        console.error('[verify-premium] Invalid planId:', planId);
        return new Response(
          JSON.stringify({ error: 'Invalid plan' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Update premium status using service role (bypasses RLS)
    const updateData: Record<string, unknown> = {
      is_premium: true,
      premium_expires_at: expiresAt?.toISOString() || null,
      updated_at: now.toISOString()
    };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('[verify-premium] Failed to update premium status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate premium' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-premium] Premium activated for user:', user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        isPremium: true,
        expiresAt: expiresAt?.toISOString() || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-premium] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
