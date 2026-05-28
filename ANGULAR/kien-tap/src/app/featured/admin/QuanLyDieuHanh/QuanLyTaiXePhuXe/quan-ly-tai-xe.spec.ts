import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuanLyTaiXe } from './quan-ly-tai-xe';

describe('QuanLyTaiXe', () => {
  let component: QuanLyTaiXe;
  let fixture: ComponentFixture<QuanLyTaiXe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuanLyTaiXe],
    }).compileComponents();

    fixture = TestBed.createComponent(QuanLyTaiXe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
