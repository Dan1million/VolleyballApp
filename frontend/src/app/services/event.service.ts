import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  VolleyballEvent,
  EventsResponse,
  EventSearchParams,
  CreateEventRequest,
} from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  searchEvents(params: EventSearchParams): Observable<EventsResponse> {
    let httpParams = new HttpParams();

    if (params.latitude !== undefined) httpParams = httpParams.set('latitude', params.latitude.toString());
    if (params.longitude !== undefined) httpParams = httpParams.set('longitude', params.longitude.toString());
    if (params.radiusMiles !== undefined) httpParams = httpParams.set('radiusMiles', params.radiusMiles.toString());
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<EventsResponse>(this.apiUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getEvent(id: number): Observable<VolleyballEvent> {
    return this.http.get<VolleyballEvent>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createEvent(data: CreateEventRequest): Observable<VolleyballEvent> {
    return this.http.post<VolleyballEvent>(this.apiUrl, data, { withCredentials: true });
  }

  signUp(eventId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${eventId}/signup`, {}, {
      withCredentials: true,
    });
  }

  cancelSignup(eventId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${eventId}/signup`, {
      withCredentials: true,
    });
  }
}
