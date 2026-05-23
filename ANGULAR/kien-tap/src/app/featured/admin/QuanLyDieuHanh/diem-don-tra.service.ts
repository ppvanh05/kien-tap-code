import { Injectable } from '@angular/core';

export interface DiemDonTra {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  mapLink: string;
  image: string | null;
  status: 'active' | 'locked';
  type: 'don-tra' | 'dung';
}

@Injectable({
  providedIn: 'root'
})
export class DiemDonTraService {
  private points: DiemDonTra[] = [
    {
      id: 1,
      name: 'Bến xe Miền Đông',
      address: '292 Đinh Bộ Lĩnh, Bình Thạnh',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234567',
      mapLink: 'https://maps.google.com/?q=Ben+xe+Mien+Dong',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 2,
      name: 'Ga Diêu Trì',
      address: 'Thị trấn Diêu Trì, Tuy Phước',
      city: 'Bình Định',
      phone: '0901234568',
      mapLink: 'https://maps.google.com/?q=Ga+Dieu+Tri',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 3,
      name: 'Ngã tư An Sương',
      address: 'QL1A, Quận 12',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234569',
      mapLink: 'https://maps.google.com/?q=Nga+tu+An+Suong',
      image: null,
      status: 'active',
      type: 'dung'
    },
    {
      id: 4,
      name: 'Big C Quy Nhơn',
      address: 'Nguyễn Thái Học, Ngô Mây',
      city: 'Bình Định',
      phone: '0901234570',
      mapLink: 'https://maps.google.com/?q=Big+C+Quy+Nhon',
      image: null,
      status: 'active',
      type: 'dung'
    },
    {
      id: 5,
      name: 'Văn phòng Thủ Đức',
      address: 'Xa lộ Hà Nội, Thủ Đức',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234571',
      mapLink: 'https://maps.google.com/?q=Van+phong+Thu+Duc',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 6,
      name: 'Bến xe Tam Quan',
      address: 'Tam Quan, Hoài Nhơn',
      city: 'Bình Định',
      phone: '0901234572',
      mapLink: 'https://maps.google.com/?q=Ben+xe+Tam+Quan',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 7,
      name: 'Sân bay Tân Sơn Nhất',
      address: 'Trường Sơn, Tân Bình',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234573',
      mapLink: 'https://maps.google.com/?q=San+bay+Tan+Son+Nhat',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 8,
      name: 'Eo Gió',
      address: 'Nhơn Lý, Quy Nhơn',
      city: 'Bình Định',
      phone: '0901234574',
      mapLink: 'https://maps.google.com/?q=Eo+Gio+Quy+Nhon',
      image: null,
      status: 'active',
      type: 'dung'
    },
    {
      id: 9,
      name: 'Bến xe Phù Mỹ',
      address: 'Thị trấn Phù Mỹ',
      city: 'Bình Định',
      phone: '0901234575',
      mapLink: 'https://maps.google.com/?q=Ben+xe+Phu+My',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 10,
      name: 'Văn phòng Quận 1',
      address: 'Nguyễn Thái Bình, Quận 1',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234576',
      mapLink: 'https://maps.google.com/?q=Van+phong+Quan+1',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 11,
      name: 'Ngã ba Phú Tài',
      address: 'QL1A, Trần Quang Diệu',
      city: 'Bình Định',
      phone: '0901234577',
      mapLink: 'https://maps.google.com/?q=Nga+ba+Phu+Tai',
      image: null,
      status: 'active',
      type: 'dung'
    },
    {
      id: 12,
      name: 'Suối Tiên',
      address: 'Xa lộ Hà Nội, Thủ Đức',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234578',
      mapLink: 'https://maps.google.com/?q=Khu+du+lich+Suoi+Tien',
      image: null,
      status: 'active',
      type: 'dung'
    },
    {
      id: 13,
      name: 'Kỳ Co',
      address: 'Nhơn Lý, Quy Nhơn',
      city: 'Bình Định',
      phone: '0901234579',
      mapLink: 'https://maps.google.com/?q=Ky+Co+Quy+Nhon',
      image: null,
      status: 'locked',
      type: 'dung'
    },
    {
      id: 14,
      name: 'Bến xe Tây Sơn',
      address: 'Phú Phong, Tây Sơn',
      city: 'Bình Định',
      phone: '0901234580',
      mapLink: 'https://maps.google.com/?q=Ben+xe+Tay+Son',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 15,
      name: 'Bến xe Miền Tây',
      address: '395 Kinh Dương Vương, Bình Tân',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234581',
      mapLink: 'https://maps.google.com/?q=Ben+xe+Mien+Tay',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 16,
      name: 'Ghềnh Ráng',
      address: 'Hàn Mặc Tử, Quy Nhơn',
      city: 'Bình Định',
      phone: '0901234582',
      mapLink: 'https://maps.google.com/?q=Gheng+Rang+Quy+Nhon',
      image: null,
      status: 'active',
      type: 'dung'
    },
    {
      id: 17,
      name: 'Sân bay Phù Cát',
      address: 'Cát Tân, Phù Cát',
      city: 'Bình Định',
      phone: '0901234583',
      mapLink: 'https://maps.google.com/?q=San+bay+Phu+Cat',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 18,
      name: 'Bến xe Ngã Tư Ga',
      address: 'Hà Huy Giáp, Quận 12',
      city: 'TP. Hồ Chí Minh',
      phone: '0901234584',
      mapLink: 'https://maps.google.com/?q=Ben+xe+Nga+Tu+Ga',
      image: null,
      status: 'locked',
      type: 'don-tra'
    },
    {
      id: 19,
      name: 'Bến xe Quy Nhơn',
      address: '71 Tây Sơn, Nguyễn Văn Cừ',
      city: 'Bình Định',
      phone: '0901234585',
      mapLink: 'https://maps.google.com/?q=Ben+xe+Quy+Nhon',
      image: null,
      status: 'active',
      type: 'don-tra'
    },
    {
      id: 20,
      name: 'Bến xe An Nhơn',
      address: 'QL1A, An Nhơn',
      city: 'Bình Định',
      phone: '0901234586',
      mapLink: 'https://maps.google.com/?q=Ben+xe+An+Nhon',
      image: null,
      status: 'active',
      type: 'don-tra'
    }
  ];

  getPoints(): DiemDonTra[] {
    return this.points;
  }

  savePoint(point: DiemDonTra) {
    const index = this.points.findIndex(p => p.id === point.id);
    if (index !== -1) {
      this.points[index] = { ...point };
    }
  }

  addPoint(point: Omit<DiemDonTra, 'id'>): DiemDonTra {
    const newId = Math.max(...this.points.map(p => p.id), 0) + 1;
    const newPoint = { ...point, id: newId } as DiemDonTra;
    this.points.unshift(newPoint);
    return newPoint;
  }

  deletePoint(id: number) {
    const index = this.points.findIndex(p => p.id === id);
    if (index !== -1) {
      this.points.splice(index, 1);
    }
  }
}
