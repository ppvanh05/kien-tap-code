import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="px-4 py-3 rounded shadow-lg flex items-center justify-between min-w-[300px] text-white animate-slide-in pointer-events-auto"
          [ngClass]="{
            'bg-success': toast.type === 'success',
            'bg-danger': toast.type === 'error',
            'bg-warning': toast.type === 'warning',
            'bg-info': toast.type === 'info'
          }"
        >
          <span>{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)" class="ml-4 text-white hover:text-gray-200">
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
