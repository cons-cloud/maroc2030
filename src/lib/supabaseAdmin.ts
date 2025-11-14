import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tywnsgsufwxienpgbosm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d25zZ3N1Znd4aWVucGdib3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0ODAzMCwiZXhwIjoyMDc3OTI0MDMwfQ.WqKLHfhkSKCFDPTtVPl59WYBba7b7KVs5VrApHyd2Rg';

// Client admin avec la clé service_role
// ⚠️ À utiliser UNIQUEMENT côté serveur ou dans des opérations admin sécurisées
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
