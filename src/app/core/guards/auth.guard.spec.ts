import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { RouterTestingModule } from '@angular/router/testing';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getSession']);
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should return true if user is logged in (has session)', async () => {
    // Arrange
    authServiceSpy.getSession.and.returnValue(Promise.resolve({} as any));

    // Act
    const result = await TestBed.runInInjectionContext(() => {
      return authGuard({} as any, {} as any);
    });

    // Assert
    expect(result).toBeTrue();
  });

  it('should redirect to /admin/login if user is not logged in', async () => {
    // Arrange
    const mockUrlTree = {} as UrlTree;
    authServiceSpy.getSession.and.returnValue(Promise.resolve(null));
    routerSpy.parseUrl.and.returnValue(mockUrlTree);

    // Act
    const result = await TestBed.runInInjectionContext(() => {
      return authGuard({} as any, {} as any);
    });

    // Assert
    expect(result).toBe(mockUrlTree);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/admin/login');
  });
});
