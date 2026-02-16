import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location, Court } from '../models/location.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations`, { withCredentials: true });
  }

  getLocation(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/locations/${id}`, { withCredentials: true });
  }

  createLocation(data: Partial<Location>): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/locations`, data, { withCredentials: true });
  }

  getCourts(locationId?: number): Observable<Court[]> {
    let params = new HttpParams();
    if (locationId) {
      params = params.set('locationId', locationId.toString());
    }
    return this.http.get<Court[]>(`${this.apiUrl}/courts`, { params, withCredentials: true });
  }

  createCourt(data: Partial<Court> & { locationId: number }): Observable<Court> {
    return this.http.post<Court>(`${this.apiUrl}/courts`, data, { withCredentials: true });
  }
}
