export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  created_at: string;
  courts?: Court[];
}

export interface Court {
  id: number;
  location_id: number;
  name: string;
  court_type: 'indoor' | 'outdoor' | 'beach';
  is_indoor: boolean;
  surface_type: 'sand' | 'grass' | 'hardwood' | 'other';
  location_name?: string;
  location_address?: string;
}
