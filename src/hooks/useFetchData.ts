import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useFetchData = <T,>(table: string, query: string = '*', filter: { column: string; value: any } | null = null) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let queryBuilder = supabase
        .from(table)
        .select(query)
        .eq('available', true);
      
      if (filter) {
        queryBuilder = queryBuilder.eq(filter.column, filter.value);
      }
      
      const { data: fetchedData, error: fetchError } = await queryBuilder as unknown as { 
        data: T[] | null; 
        error: any 
      };

      if (fetchError) throw fetchError;
      
      setData(fetchedData || [] as T[]);
    } catch (err) {
      console.error(`Erreur lors du chargement des données de ${table}:`, err);
      setError('Impossible de charger les données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [table, query, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, isLoading, error, refetch };
};

export default useFetchData;
