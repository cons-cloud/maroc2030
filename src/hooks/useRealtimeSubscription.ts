import { useEffect, useRef } from 'react';
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Callback<T extends Record<string, any> = Record<string, any>> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

interface RealtimeSubscriptionOptions<T extends Record<string, any>> {
  table: string;
  filter?: string;
  callback: Callback<T>;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: 'public' | string;
  enabled?: boolean;
}

export function useRealtimeSubscription<T extends Record<string, any>>({
  table,
  filter,
  callback,
  event = '*',
  schema = 'public',
  enabled = true,
}: RealtimeSubscriptionOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    console.log(`[useRealtimeSubscription] Initializing subscription for table: ${table}`);
    
    // Créer un canal de souscription avec un ID unique
    const channelName = `db-changes-${table}-${Date.now()}`;
    channelRef.current = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });
    
    if (!channelRef.current) {
      console.error('[useRealtimeSubscription] Failed to create channel');
      return;
    }

    // Configurer l'écoute des changements
    const subscription = channelRef.current
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log(`[useRealtimeSubscription] Received ${payload.eventType} event for ${table}`, payload);
          try {
            callback(payload);
          } catch (error) {
            console.error('[useRealtimeSubscription] Error in callback:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('[useRealtimeSubscription] Subscription error:', err);
          return;
        }
        console.log(`[useRealtimeSubscription] Subscription status: ${status}`);
      });

    // Gestion des erreurs de connexion
    const handleError = (event: any) => {
      console.error('[useRealtimeSubscription] Channel error:', event);
      // Tentative de reconnexion après un délai
      setTimeout(() => {
        console.log('[useRealtimeSubscription] Attempting to resubscribe...');
        subscription && subscription.unsubscribe();
        channelRef.current?.subscribe();
      }, 1000);
    };

    channelRef.current.on('broadcast', { event: 'error' }, handleError);

    // Nettoyage lors du démontage du composant
    return () => {
      console.log('[useRealtimeSubscription] Cleaning up subscription for table:', table);
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('[useRealtimeSubscription] Error during cleanup:', error);
        }
        channelRef.current = null;
      }
    };
  }, [table, filter, callback, event, schema, enabled]);

  // Retourner des méthodes pour gérer manuellement l'abonnement si nécessaire
  return {
    unsubscribe: () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
    resubscribe: () => {
      if (!channelRef.current) return;
      channelRef.current.unsubscribe();
      channelRef.current.subscribe();
    },
  };
}

export default useRealtimeSubscription;
