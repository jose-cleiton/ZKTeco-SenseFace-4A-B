import db from './db.ts';

export interface RtLog {
  id?: number;
  sn: string;
  raw_line: string;
  parsed_json: string;
  received_at?: string;
}

export class LogRepository {
  static create(log: Omit<RtLog, 'id' | 'received_at'>) {
    const stmt = db.prepare(`
      INSERT INTO rtlogs (sn, raw_line, parsed_json)
      VALUES (?, ?, ?)
    `);
    return stmt.run(log.sn, log.raw_line, log.parsed_json);
  }

  static getBySn(sn: string, limit = 100): RtLog[] {
    const stmt = db.prepare(`
      SELECT * FROM rtlogs WHERE sn = ? ORDER BY received_at DESC LIMIT ?
    `);
    return stmt.all(sn, limit) as RtLog[];
  }

  static getAll(limit = 100): RtLog[] {
    const stmt = db.prepare(`
      SELECT * FROM rtlogs ORDER BY received_at DESC LIMIT ?
    `);
    return stmt.all(limit) as RtLog[];
  }
}
