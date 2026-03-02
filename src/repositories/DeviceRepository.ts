import db from './db.ts';

export interface Device {
  id?: number;
  sn: string;
  ip: string;
  last_seen?: string;
  created_at?: string;
}

export class DeviceRepository {
  static upsert(device: Device) {
    const stmt = db.prepare(`
      INSERT INTO devices (sn, ip, last_seen)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(sn) DO UPDATE SET
        ip = excluded.ip,
        last_seen = excluded.last_seen
    `);
    return stmt.run(device.sn, device.ip);
  }

  static findBySn(sn: string): Device | undefined {
    const stmt = db.prepare('SELECT * FROM devices WHERE sn = ?');
    return stmt.get(sn) as Device | undefined;
  }

  static getAll(): Device[] {
    const stmt = db.prepare('SELECT * FROM devices ORDER BY last_seen DESC');
    return stmt.all() as Device[];
  }
}
