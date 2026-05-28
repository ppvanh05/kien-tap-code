import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-select-container" (click)="toggleDropdown($event)">
      <div class="select-trigger" [class.open]="isOpen" [class.placeholder]="!value">
        <span>{{ getDisplayLabel() }}</span>
        <span class="select-arrow"></span>
      </div>
      <div class="select-options-menu" *ngIf="isOpen">
        <div 
          *ngFor="let opt of options" 
          class="select-option-item" 
          [class.active]="value === opt.value" 
          [class.disabled]="opt.disabled"
          (mousedown)="!opt.disabled && selectOption(opt.value, $event)"
        >
          {{ opt.label }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-select-container {
      position: relative;
      width: 100%;
      user-select: none;
      font-family: inherit;
    }
    
    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      font-size: 14px;
      background-color: white;
      color: #2d3748;
      cursor: pointer;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .select-trigger.placeholder {
      color: #a0aec0;
    }
    
    .select-trigger:hover, .select-trigger.open {
      border-color: var(--primary-color, #009ba1);
    }
    
    .select-trigger.open {
      box-shadow: 0 0 0 3px rgba(0, 155, 161, 0.1);
    }
    
    .select-arrow {
      width: 20px;
      height: 20px;
      background-image: url("data:image/svg+xml;utf8,<svg fill='%23718096' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      transition: transform 0.2s;
    }
    
    .select-trigger.open .select-arrow {
      transform: rotate(180deg);
      background-image: url("data:image/svg+xml;utf8,<svg fill='%23009ba1' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
    }
    
    .select-options-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      width: 100%;
      background-color: #ffffff;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 1000;
      max-height: 240px;
      overflow-y: auto;
      animation: dropdownFadeIn 0.15s ease-out;
    }
    
    @keyframes dropdownFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .select-option-item {
      padding: 10px 14px;
      font-size: 14px;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }
    
    .select-option-item:hover {
      background-color: var(--primary-color, #009ba1) !important;
      color: #ffffff !important;
    }
    
    .select-option-item.active {
      color: var(--primary-color, #009ba1);
      background-color: rgba(0, 155, 161, 0.05);
      font-weight: 600;
    }
    
    .select-option-item.active:hover {
      color: #ffffff !important;
      background-color: var(--primary-color, #009ba1) !important;
    }
    
    .select-option-item.disabled {
      color: #cbd5e0 !important;
      cursor: not-allowed !important;
      background-color: #f7fafc !important;
    }
    
    .select-option-item.disabled:hover {
      background-color: #f7fafc !important;
      color: #cbd5e0 !important;
    }
  `]
})
export class CustomSelectComponent {
  @Input() value: any;
  @Input() placeholder: string = 'Chọn...';
  @Input() options: { value: any, label: string, disabled?: boolean }[] = [];
  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  selectOption(val: any, event: Event) {
    event.stopPropagation();
    this.value = val;
    this.valueChange.emit(val);
    this.isOpen = false;
  }

  getDisplayLabel(): string {
    const selectedOpt = this.options.find(opt => opt.value === this.value);
    return selectedOpt ? selectedOpt.label : this.placeholder;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
