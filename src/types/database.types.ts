export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          name: string
          age: number
          initial_weight: number
          height: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          initial_weight: number
          height: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          initial_weight?: number
          height?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      weight_records: {
        Row: {
          id: string
          participant_id: string
          weight: number
          recorded_at: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          weight: number
          recorded_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          weight?: number
          recorded_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'weight_records_participant_id_fkey'
            columns: ['participant_id']
            referencedRelation: 'participants'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      participant_rankings: {
        Row: {
          id: string
          name: string
          age: number
          initial_weight: number
          height: number
          created_at: string
          current_weight: number
          latest_recorded_at: string | null
          weight_diff: number
          weight_loss_percentage: number
          min_weight: number | null
          max_weight: number | null
          total_records: number
          current_bmi: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Helper types
export type Participant = Database['public']['Tables']['participants']['Row']
export type ParticipantInsert = Database['public']['Tables']['participants']['Insert']
export type ParticipantUpdate = Database['public']['Tables']['participants']['Update']

export type WeightRecord = Database['public']['Tables']['weight_records']['Row']
export type WeightRecordInsert = Database['public']['Tables']['weight_records']['Insert']
export type WeightRecordUpdate = Database['public']['Tables']['weight_records']['Update']

export type ParticipantRanking = Database['public']['Views']['participant_rankings']['Row']
