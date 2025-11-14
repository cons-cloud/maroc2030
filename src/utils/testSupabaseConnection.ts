import { supabase } from '../../supabaseClient';

export async function testSupabaseConnection() {
  try {
    console.log("Test de connexion à Supabase...");
    
    // Tester une requête simple
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Erreur lors de la connexion à Supabase:", error);
      return false;
    }
    
    console.log("✅ Connexion à Supabase réussie !");
    console.log("Données de test:", data);
    return true;
  } catch (error) {
    console.error("Erreur inattendue lors du test de connexion:", error);
    return false;
  }
}

// Exécuter le test si ce fichier est exécuté directement
if (import.meta.main) {
  testSupabaseConnection();
}
