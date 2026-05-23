import { Injectable } from '@angular/core';

export interface Driver {
  id: number;
  name: string;
  dob: string;
  phone: string;
  licenseClass: string;
  licenseExpiry: string;
  avatar: string | null;
  licenseFront: string | null;
  licenseBack: string | null;
  cccdFront: string | null;
  cccdBack: string | null;
  status: 'active' | 'locked';
  cccdNumber: string;
  role: 'driver' | 'assistant';
}

@Injectable({
  providedIn: 'root'
})
export class TaiXeService {
  private drivers: Driver[] = [
    {
      id: 1,
      name: 'Hoàng Anh Tú',
      dob: '23/09/1981',
      phone: '0357418245',
      licenseClass: 'C',
      licenseExpiry: '14/08/2029',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '001201004562',
      role: 'driver'
    },
    {
      id: 2,
      name: 'Nguyễn Văn Long',
      dob: '13/08/1974',
      phone: '0912345678',
      licenseClass: 'C',
      licenseExpiry: '11/04/2028',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '002203009854',
      role: 'driver'
    },
    {
      id: 3,
      name: 'Trần Minh Quân',
      dob: '05/12/1985',
      phone: '0987654321',
      licenseClass: 'D',
      licenseExpiry: '20/09/2030',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '003204005612',
      role: 'driver'
    },
    {
      id: 4,
      name: 'Lê Quốc Bảo',
      dob: '17/03/1979',
      phone: '0908123456',
      licenseClass: 'E',
      licenseExpiry: '03/01/2027',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '004205007834',
      role: 'driver'
    },
    {
      id: 5,
      name: 'Phạm Thành Đạt',
      dob: '28/06/1998',
      phone: '0376542198',
      licenseClass: '',
      licenseExpiry: '',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '005206001298',
      role: 'assistant'
    },
    {
      id: 6,
      name: 'Đặng Hải Nam',
      dob: '02/02/1988',
      phone: '0945123786',
      licenseClass: 'D',
      licenseExpiry: '09/10/2028',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '006207003461',
      role: 'driver'
    },
    {
      id: 7,
      name: 'Võ Minh Khang',
      dob: '11/11/1992',
      phone: '0934567812',
      licenseClass: '',
      licenseExpiry: '',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '007208009845',
      role: 'assistant'
    },
    {
      id: 8,
      name: 'Nguyễn Quốc Huy',
      dob: '21/07/2000',
      phone: '0398745612',
      licenseClass: '',
      licenseExpiry: '',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '008209001254',
      role: 'assistant'
    },
    {
      id: 9,
      name: 'Trần Gia Bảo',
      dob: '09/05/1983',
      phone: '0369852147',
      licenseClass: 'E',
      licenseExpiry: '17/06/2031',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'active',
      cccdNumber: '009210008546',
      role: 'driver'
    },
    {
      id: 10,
      name: 'Phan Quốc Thịnh',
      dob: '30/01/1976',
      phone: '0917788990',
      licenseClass: 'E',
      licenseExpiry: '25/12/2026',
      avatar: null,
      licenseFront: null,
      licenseBack: null,
      cccdFront: null,
      cccdBack: null,
      status: 'locked',
      cccdNumber: '010211005698',
      role: 'driver'
    }
  ];

  getDrivers(): Driver[] {
    return this.drivers;
  }

  getDriversList(): { name: string, status: 'active' | 'locked' }[] {
    return this.drivers
      .filter(d => d.role === 'driver')
      .map(d => ({ name: d.name, status: d.status }));
  }

  getAssistantsList(): { name: string, status: 'active' | 'locked' }[] {
    return this.drivers
      .filter(d => d.role === 'assistant')
      .map(d => ({ name: d.name, status: d.status }));
  }
}
