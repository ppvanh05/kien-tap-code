import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AuthModalMode = 'login' | 'register' | 'forgot' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  private modalModeSubject = new BehaviorSubject<AuthModalMode>(null);
  modalMode$ = this.modalModeSubject.asObservable();

  openLoginModal() {
    this.modalModeSubject.next('login');
  }

  openRegisterModal() {
    this.modalModeSubject.next('register');
  }

  openForgotModal() {
    this.modalModeSubject.next('forgot');
  }

  closeModal() {
    this.modalModeSubject.next(null);
  }
}
