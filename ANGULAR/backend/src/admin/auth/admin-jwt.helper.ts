import * as crypto from 'crypto';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'default-secret-key-for-admin-portal-2026';

export class AdminJwtPayload {
  maNhanVien: string;
  email: string;
  loaiTaiKhoan: string;
  tenHienThi: string;
  quyen: string[];
  exp?: number;
}

export class AdminJwtHelper {
  private static base64url(buffer: Buffer): string {
    return buffer.toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private static base64urlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  static sign(payload: Omit<AdminJwtPayload, 'exp'>, expiresInSeconds: number = 86400): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const fullPayload: AdminJwtPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    };

    const headerStr = this.base64url(Buffer.from(JSON.stringify(header)));
    const payloadStr = this.base64url(Buffer.from(JSON.stringify(fullPayload)));

    const input = `${headerStr}.${payloadStr}`;
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(input).digest();
    const signatureStr = this.base64url(signature);

    return `${input}.${signatureStr}`;
  }

  static verify(token: string): AdminJwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerStr, payloadStr, signatureStr] = parts;
      const input = `${headerStr}.${payloadStr}`;
      const signature = crypto.createHmac('sha256', JWT_SECRET).update(input).digest();
      const expectedSignatureStr = this.base64url(signature);

      if (signatureStr !== expectedSignatureStr) {
        return null;
      }

      const payload = JSON.parse(this.base64urlDecode(payloadStr)) as AdminJwtPayload;
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (e) {
      return null;
    }
  }
}
