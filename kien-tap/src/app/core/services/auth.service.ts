import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userName = new BehaviorSubject<string>('Guest'); // Giá trị mặc định là 'Guest'
  userName$: Observable<string> = this._userName.asObservable();

  private _isLoggedIn = new BehaviorSubject<boolean>(false); // Thêm BehaviorSubject cho trạng thái đăng nhập
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable(); // Expose nó dưới dạng Observable

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUserName = localStorage.getItem('currentUserName');
      if (storedUserName) {
        this._userName.next(storedUserName);
        this._isLoggedIn.next(true); // Nếu có tên người dùng, coi như đã đăng nhập
      }
    }
  }

  setUserName(name: string) {
    this._userName.next(name);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('currentUserName', name);
    }
  }

  login(userName: string) {
    this.setUserName(userName);
    this._isLoggedIn.next(true);
  }

  logout() {
    this._userName.next('Guest');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('currentUserName', 'Guest'); // Xóa tên người dùng khỏi localStorage
    }
    this._isLoggedIn.next(false);
  }
}
