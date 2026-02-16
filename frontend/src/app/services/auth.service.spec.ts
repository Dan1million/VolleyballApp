import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: null,
    createdAt: '2025-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no current user', () => {
    expect(service.currentUser).toBeNull();
    expect(service.isLoggedIn).toBeFalse();
  });

  // ── login ──
  describe('login', () => {
    it('should send POST to /auth/login and set currentUser', () => {
      service.login({ email: 'test@example.com', password: 'pass' }).subscribe((res) => {
        expect(res.user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ message: 'Login successful.', user: mockUser });

      expect(service.currentUser).toEqual(mockUser);
      expect(service.isLoggedIn).toBeTrue();
    });
  });

  // ── register ──
  describe('register', () => {
    it('should send POST to /auth/register and set currentUser', () => {
      service.register({
        email: 'new@example.com',
        password: 'pass123',
        firstName: 'New',
        lastName: 'User',
      }).subscribe((res) => {
        expect(res.user.firstName).toBe('Test');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/auth/register'));
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Account created.', user: mockUser });

      expect(service.currentUser).toEqual(mockUser);
    });
  });

  // ── logout ──
  describe('logout', () => {
    it('should send POST to /auth/logout and clear currentUser', () => {
      // First set a user
      (service as any).currentUserSubject.next(mockUser);
      expect(service.isLoggedIn).toBeTrue();

      service.logout().subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/auth/logout'));
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Logged out.' });

      expect(service.currentUser).toBeNull();
      expect(service.isLoggedIn).toBeFalse();
    });
  });

  // ── checkSession ──
  describe('checkSession', () => {
    it('should set currentUser on successful session check', () => {
      service.checkSession().subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/auth/me'));
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUser });

      expect(service.currentUser).toEqual(mockUser);
    });

    it('should clear currentUser on failed session check', () => {
      (service as any).currentUserSubject.next(mockUser);

      service.checkSession().subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/auth/me'));
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(service.currentUser).toBeNull();
    });
  });

  // ── currentUser$ observable ──
  describe('currentUser$', () => {
    it('should emit null initially', (done) => {
      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should emit user after login', () => {
      const emissions: (User | null)[] = [];
      service.currentUser$.subscribe((user) => emissions.push(user));

      service.login({ email: 'test@example.com', password: 'pass' }).subscribe();
      httpMock.expectOne((r) => r.url.includes('/auth/login'))
        .flush({ message: 'ok', user: mockUser });

      expect(emissions).toContain(mockUser);
    });
  });
});
