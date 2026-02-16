import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should send GET to /users/me', () => {
      service.getProfile().subscribe((user) => {
        expect(user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/users/me'));
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      req.flush({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: null,
        createdAt: '2025-01-01',
      });
    });
  });

  describe('updateProfile', () => {
    it('should send PUT to /users/me with updated data', () => {
      service.updateProfile({ firstName: 'Updated' }).subscribe((user) => {
        expect(user.firstName).toBe('Updated');
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/users/me'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.firstName).toBe('Updated');
      req.flush({
        id: 1,
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User',
        dateOfBirth: null,
        createdAt: '2025-01-01',
      });
    });
  });
});
