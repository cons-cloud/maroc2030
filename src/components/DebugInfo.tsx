import { useEffect, useState } from 'react';

export default function DebugInfo() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Récupérer toutes les variables d'environnement commençant par VITE_
      const env = Object.keys(import.meta.env)
        .filter(key => key.startsWith('VITE_'))
        .reduce((obj, key) => {
          obj[key] = import.meta.env[key];
          return obj;
        }, {} as Record<string, string>);
      
      setEnvVars(env);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Chargement des informations de débogage...</div>;
  }

  if (error) {
    return <div className="text-red-600">Erreur: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Informations de débogage</h2>
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-mono font-bold">{key}:</span>{' '}
            <span className="font-mono">
              {key.includes('KEY') || key.includes('SECRET') 
                ? '••••••••' 
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
