import db from './db.ts';

export enum CommandStatus {
  PENDING = 0,
  SENT = 1,
  ACKED = 2,
  FAILED = 3
}

export interface Command {
  id?: number;
  sn: string;
  command_text: string;
  status: CommandStatus;
  created_at?: string;
  sent_at?: string;
  ack_at?: string;
  response_text?: string;
  job_id?: string;
}

export class CommandRepository {
  static create(cmd: Omit<Command, 'id' | 'status' | 'created_at'>) {
    const stmt = db.prepare(`
      INSERT INTO commands (sn, command_text, status, job_id)
      VALUES (?, ?, 0, ?)
    `);
    return stmt.run(cmd.sn, cmd.command_text, cmd.job_id || null);
  }

  static getNextPending(sn: string): Command | undefined {
    const stmt = db.prepare(`
      SELECT * FROM commands 
      WHERE sn = ? AND status = 0 
      ORDER BY id ASC LIMIT 1
    `);
    return stmt.get(sn) as Command | undefined;
  }

  static markAsSent(id: number) {
    const stmt = db.prepare(`
      UPDATE commands SET status = 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(id);
  }

  static markAsAcked(id: number, response: string) {
    const stmt = db.prepare(`
      UPDATE commands SET status = 2, ack_at = CURRENT_TIMESTAMP, response_text = ? WHERE id = ?
    `);
    return stmt.run(response, id);
  }

  static markAsFailed(id: number, error: string) {
    const stmt = db.prepare(`
      UPDATE commands SET status = 3, ack_at = CURRENT_TIMESTAMP, response_text = ? WHERE id = ?
    `);
    return stmt.run(error, id);
  }

  static findByJobId(jobId: string): Command[] {
    const stmt = db.prepare('SELECT * FROM commands WHERE job_id = ? ORDER BY id ASC');
    return stmt.all(jobId) as Command[];
  }
}
