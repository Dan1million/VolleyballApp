import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── searchEvents ──
  describe('searchEvents', () => {
    it('should send GET with query params', () => {
      service.searchEvents({ sortBy: 'date', page: 1, limit: 10 }).subscribe((res) => {
        expect(res.events).toHaveSize(1);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/events') && r.params.has('sortBy'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('sortBy')).toBe('date');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ events: [{ id: 1 }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } });
    });

    it('should omit undefined params', () => {
      service.searchEvents({}).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/events'));
      expect(req.request.params.keys()).toHaveSize(0);
      req.flush({ events: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });

    it('should include proximity params when provided', () => {
      service.searchEvents({ latitude: 25.76, longitude: -80.19, radiusMiles: 25 }).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/events'));
      expect(req.request.params.get('latitude')).toBe('25.76');
      expect(req.request.params.get('longitude')).toBe('-80.19');
      expect(req.request.params.get('radiusMiles')).toBe('25');
      req.flush({ events: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });
  });

  // ── getEvent ──
  describe('getEvent', () => {
    it('should send GET to /events/:id', () => {
      service.getEvent(42).subscribe((event) => {
        expect(event.id).toBe(42);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/events/42'));
      expect(req.request.method).toBe('GET');
      req.flush({ id: 42, title: 'Test Event' });
    });
  });

  // ── getMyEvents ──
  describe('getMyEvents', () => {
    it('should send GET to /events/my', () => {
      service.getMyEvents().subscribe((res) => {
        expect(res.events).toHaveSize(2);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/events/my'));
      expect(req.request.method).toBe('GET');
      req.flush({ events: [{ id: 1 }, { id: 2 }] });
    });
  });

  // ── createEvent ──
  describe('createEvent', () => {
    it('should send POST to /events', () => {
      const eventData = {
        title: 'Beach Bash',
        courtId: 1,
        eventDate: '2026-06-15T14:00:00Z',
        maxPlayers: 12,
        skillLevel: 'all',
      };

      service.createEvent(eventData).subscribe((event) => {
        expect(event.id).toBe(10);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/events'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe('Beach Bash');
      req.flush({ id: 10, title: 'Beach Bash' });
    });
  });

  // ── signUp ──
  describe('signUp', () => {
    it('should send POST to /events/:id/signup', () => {
      service.signUp(5).subscribe((res) => {
        expect(res.message).toContain('signed up');
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/events/5/signup'));
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Successfully signed up for the event.' });
    });
  });

  // ── cancelSignup ──
  describe('cancelSignup', () => {
    it('should send DELETE to /events/:id/signup', () => {
      service.cancelSignup(5).subscribe((res) => {
        expect(res.message).toContain('cancelled');
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/events/5/signup'));
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Successfully cancelled signup.' });
    });
  });

  // ── cancelEvent ──
  describe('cancelEvent', () => {
    it('should send DELETE to /events/:id', () => {
      service.cancelEvent(3).subscribe((res) => {
        expect(res.message).toContain('cancelled');
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/events/3'));
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Event cancelled and deleted successfully.' });
    });
  });
});
