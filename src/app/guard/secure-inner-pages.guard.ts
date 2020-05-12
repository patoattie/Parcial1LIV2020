import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SecureInnerPagesGuard implements CanActivate
{
  constructor(
    public authService: AuthService,
    public router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
  {
    if (this.authService.isLoggedIn())
    {
      console.log('Acceso no permitido');
      // this.router.navigate(['Principal']);
      return false;
    }

    return true;
  }
}
