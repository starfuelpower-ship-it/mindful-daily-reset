import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Apple App Store API endpoints
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// Valid product IDs for this app
const VALID_SUBSCRIPTION_PRODUCTS = [
  'app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.monthly',
  'app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.annual',
  'app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.lifetime',
];

interface AppleReceiptResponse {
  status: number;
  receipt?: {
    bundle_id: string;
    in_app?: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date_ms: string;
      expires_date_ms?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
  }>;
  environment?: string;
}

/**
 * Validates receipt with Apple's servers
 * First tries production, then sandbox if status 21007 (sandbox receipt sent to production)
 */
async function validateWithApple(
  receiptData: string,
  appSharedSecret?: string
): Promise<{ success: boolean; data?: AppleReceiptResponse; environment: string; error?: string }> {
  const requestBody: Record<string, string> = {
    'receipt-data': receiptData,
  };
  
  if (appSharedSecret) {
    requestBody['password'] = appSharedSecret;
  }

  console.log('[verify-premium] Validating receipt with Apple production...');
  
  // Try production first
  try {
    const prodResponse = await fetch(APPLE_PRODUCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    
    const prodData: AppleReceiptResponse = await prodResponse.json();
    console.log('[verify-premium] Apple production response status:', prodData.status);
    
    // Status 0 = valid receipt
    if (prodData.status === 0) {
      return { success: true, data: prodData, environment: 'production' };
    }
    
    // Status 21007 = sandbox receipt sent to production, try sandbox
    if (prodData.status === 21007) {
      console.log('[verify-premium] Sandbox receipt detected, trying sandbox...');
      const sandboxResponse = await fetch(APPLE_SANDBOX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const sandboxData: AppleReceiptResponse = await sandboxResponse.json();
      console.log('[verify-premium] Apple sandbox response status:', sandboxData.status);
      
      if (sandboxData.status === 0) {
        return { success: true, data: sandboxData, environment: 'sandbox' };
      }
      
      return { 
        success: false, 
        environment: 'sandbox',
        error: `Apple validation failed with status: ${sandboxData.status}` 
      };
    }
    
    return { 
      success: false, 
      environment: 'production',
      error: `Apple validation failed with status: ${prodData.status}` 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[verify-premium] Apple validation error:', error);
    return { 
      success: false, 
      environment: 'unknown',
      error: `Apple validation request failed: ${errorMessage}` 
    };
  }
}

/**
 * Finds the relevant subscription transaction from Apple's response
 */
function findSubscriptionTransaction(
  appleResponse: AppleReceiptResponse,
  expectedProductId: string
): { transactionId: string; expiresDate: Date | null; productId: string } | null {
  // Check latest_receipt_info first (for subscriptions)
  const transactions = appleResponse.latest_receipt_info || appleResponse.receipt?.in_app || [];
  
  // Find matching product, prefer the most recent transaction
  const matchingTxns = transactions
    .filter(txn => VALID_SUBSCRIPTION_PRODUCTS.includes(txn.product_id))
    .sort((a, b) => parseInt(b.purchase_date_ms) - parseInt(a.purchase_date_ms));
  
  if (matchingTxns.length === 0) {
    console.log('[verify-premium] No matching subscription found in receipt');
    return null;
  }
  
  const latestTxn = matchingTxns[0];
  const expiresDate = latestTxn.expires_date_ms 
    ? new Date(parseInt(latestTxn.expires_date_ms))
    : null; // Lifetime has no expiry
  
  return {
    transactionId: latestTxn.transaction_id,
    expiresDate,
    productId: latestTxn.product_id,
  };
}

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

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const appleSharedSecret = Deno.env.get('APPLE_SHARED_SECRET'); // Optional
    
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

    // SECURITY: Require receipt for Apple IAP validation
    if (!receipt) {
      console.error('[verify-premium] Missing receipt data - cannot verify purchase');
      return new Response(
        JSON.stringify({ error: 'Purchase verification failed: missing receipt data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if transaction was already processed (replay attack prevention)
    if (transactionId) {
      const { data: existingTxn } = await supabaseAdmin
        .from('verified_transactions')
        .select('id')
        .eq('transaction_id', transactionId)
        .maybeSingle();
      
      if (existingTxn) {
        console.warn('[verify-premium] Transaction already processed:', transactionId);
        return new Response(
          JSON.stringify({ error: 'Transaction already processed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate receipt with Apple
    const appleValidation = await validateWithApple(receipt, appleSharedSecret);
    
    if (!appleValidation.success || !appleValidation.data) {
      console.error('[verify-premium] Apple validation failed:', appleValidation.error);
      return new Response(
        JSON.stringify({ error: 'Receipt validation failed', details: appleValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the subscription transaction in the validated receipt
    const expectedProductId = `app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.${planId}`;
    const subscriptionInfo = findSubscriptionTransaction(appleValidation.data, expectedProductId);
    
    if (!subscriptionInfo) {
      console.error('[verify-premium] No valid subscription found in receipt for plan:', planId);
      return new Response(
        JSON.stringify({ error: 'No valid subscription found in receipt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-premium] Validated subscription:', {
      productId: subscriptionInfo.productId,
      transactionId: subscriptionInfo.transactionId,
      expiresDate: subscriptionInfo.expiresDate,
    });

    // Store verified transaction to prevent replay
    const { error: txnError } = await supabaseAdmin
      .from('verified_transactions')
      .insert({
        user_id: user.id,
        transaction_id: subscriptionInfo.transactionId,
        product_id: subscriptionInfo.productId,
        purchase_type: 'subscription',
        environment: appleValidation.environment,
        raw_receipt_data: { 
          environment: appleValidation.data.environment,
          bundle_id: appleValidation.data.receipt?.bundle_id 
        },
      });

    if (txnError) {
      // If it's a unique constraint violation, transaction was already processed
      if (txnError.code === '23505') {
        console.warn('[verify-premium] Transaction already exists:', subscriptionInfo.transactionId);
        return new Response(
          JSON.stringify({ error: 'Transaction already processed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[verify-premium] Failed to store transaction:', txnError);
      // Continue anyway - premium activation is more important
    }

    // Calculate expiration based on Apple's response or plan type
    let expiresAt: Date | null = subscriptionInfo.expiresDate;
    
    // For lifetime, ensure no expiration
    if (planId === 'lifetime') {
      expiresAt = null;
    }

    // Update premium status using service role (bypasses RLS)
    const now = new Date();
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
