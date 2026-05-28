import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
<<<<<<< HEAD
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Get Supabase Client Instance
  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper to subscribe to realtime changes on a specific table
  subscribeTableChanges(
    tableName: string, 
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel(`${tableName}-realtime-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
=======
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
>>>>>>> origin/nghi
  }
}
