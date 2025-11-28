import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Définition des types pour les événements de changement
interface BasePayload<T> {
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  errors: string[] | null;
  new: T;
  old: T;
}

type Callback<T = any> = (payload: BasePayload<T>) => void;

interface RealtimeSubscriptionOptions<T> {
  table: string;
  filter?: string;
  callback: Callback<T>;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: 'public' | string;
  enabled?: boolean;
}

/**
 * Hook personnalisé pour s'abonner aux changements en temps réel d'une table Supabase
 */
function useRealtimeSubscription<T = any>({
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
    const channel = supabase.channel(channelName);
    
    if (!channel) {
      console.error('[useRealtimeSubscription] Failed to create channel');
      return;
    }

    // Configurer l'écoute des changements
    const subscription = channel
      .on('postgres_changes' as any, {
        event: event === '*' ? undefined : event,
        schema,
        table,
        filter,
      }, (payload: any) => {
        console.log(`[useRealtimeSubscription] Received ${payload.eventType} event for ${table}`, payload);
        try {
          callback(payload);
        } catch (error) {
          console.error('[useRealtimeSubscription] Error in callback:', error);
        }
      });

    // S'abonner au canal
    subscription.subscribe((status) => {
      console.log(`[useRealtimeSubscription] Subscription status:`, status);
    });

    channelRef.current = channel;

    // Nettoyer l'abonnement lors du démontage du composant
    return () => {
      console.log(`[useRealtimeSubscription] Cleaning up subscription for table: ${table}`);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        } catch (error) {
          console.error('[useRealtimeSubscription] Error during cleanup:', error);
        }
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
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current.subscribe();
      }
    }
  };
}

export default useRealtimeSubscription;
