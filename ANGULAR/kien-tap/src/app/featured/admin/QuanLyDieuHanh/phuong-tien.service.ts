import { Injectable } from '@angular/core';

export interface Vehicle {
  id: number;
  name: string;
  licensePlate: string;
  type: string;
  seats: number;
  floors?: number;
  rows?: number;
  registrationExpiry: string;
  insuranceExpiry: string;
  amenities: string[];
  status: 'active' | 'locked';
  registrationImage?: string;
  insuranceImage?: string;
  vehicleImage?: string;
  selectedSeats: string[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PhuongTienService {
  private vehicles: Vehicle[] = [
    {
      id: 1,
      name: 'Limousine 22 phòng Premium',
      licensePlate: '59B-01234',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '15/06/2027',
      insuranceExpiry: '10/06/2027',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-01')
    },
    {
      id: 2,
      name: 'Limousine 22 phòng Luxury',
      licensePlate: '77B-00987',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '20/09/2027',
      insuranceExpiry: '18/09/2027',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-02')
    },
    {
      id: 3,
      name: 'Limousine 22 phòng Deluxe',
      licensePlate: '59B-05566',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '10/11/2027',
      insuranceExpiry: '05/11/2027',
      amenities: ['wifi', 'water', 'ac', 'usb'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-03')
    },
    {
      id: 4,
      name: 'Limousine 22 phòng Gold',
      licensePlate: '77B-01122',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '12/03/2028',
      insuranceExpiry: '10/03/2028',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-04')
    },
    {
      id: 5,
      name: 'Limousine 22 phòng Silver',
      licensePlate: '59B-09988',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '08/08/2027',
      insuranceExpiry: '05/08/2027',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-05')
    },
    {
      id: 6,
      name: 'Limousine 22 phòng Diamond',
      licensePlate: '77B-05577',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '25/12/2027',
      insuranceExpiry: '20/12/2027',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-06')
    },
    {
      id: 7,
      name: 'Limousine 22 phòng Platinum',
      licensePlate: '59B-08899',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '14/05/2028',
      insuranceExpiry: '10/05/2028',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-07')
    },
    {
      id: 8,
      name: 'Limousine 22 phòng Royal',
      licensePlate: '77B-02468',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '30/06/2028',
      insuranceExpiry: '25/06/2028',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'active',
      selectedSeats: [],
      createdAt: new Date('2026-05-08')
    },
    {
      id: 9,
      name: 'Limousine 22 phòng Elite',
      licensePlate: '59B-01357',
      type: 'Limousine 22 phòng',
      seats: 22,
      floors: 2,
      rows: 2,
      registrationExpiry: '18/10/2028',
      insuranceExpiry: '15/10/2028',
      amenities: ['tivi', 'usb', 'wifi', 'water', 'ac'],
      status: 'locked',
      selectedSeats: [],
      createdAt: new Date('2026-05-09')
    }
  ];

  getVehicles(): Vehicle[] {
    return this.vehicles;
  }
}
