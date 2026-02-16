export interface VolleyballEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  max_players: number;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  created_at: string;
  creator_id: number;
  creator_first_name: string;
  creator_last_name: string;
  court_id: number;
  court_name: string;
  court_type: string;
  is_indoor: boolean;
  surface_type: string;
  location_id: number;
  location_name: string;
  location_address: string;
  location_city: string;
  location_state: string;
  latitude: number;
  longitude: number;
  signup_count?: number;
  signupCount?: number;
  signups?: EventSignup[];
  distance_miles?: number;
}

export interface EventSignup {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  signed_up_at: string;
}

export interface EventSearchParams {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'created' | 'distance';
  page?: number;
  limit?: number;
}

export interface EventsResponse {
  events: VolleyballEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  courtId: number;
  eventDate: string;
  maxPlayers?: number;
  skillLevel?: string;
}
