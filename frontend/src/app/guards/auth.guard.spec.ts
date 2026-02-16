import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], { isLoggedIn: false });
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() => {
      return authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      ) as boolean;
    });
  }

  it('should allow access when user is logged in', () => {
    (Object.getOwnPropertyDescriptor(authService, 'isLoggedIn')!.get as jasmine.Spy)
      .and.returnValue(true);

    expect(runGuard()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to /login when not logged in', () => {
    (Object.getOwnPropertyDescriptor(authService, 'isLoggedIn')!.get as jasmine.Spy)
      .and.returnValue(false);

    expect(runGuard()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
