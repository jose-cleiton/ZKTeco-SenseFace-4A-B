import db from './db.ts';

export type JobStatus = 'pending' | 'done' | 'failed' | 'timeout';

export interface Job {
  id: string;
  sn: string;
  job_type: string;
  status: JobStatus;
  requested_at?: string;
  finished_at?: string;
  result_json?: string;
  error_text?: string;
}

export class JobRepository {
  static create(job: Omit<Job, 'requested_at' | 'finished_at'>) {
    const stmt = db.prepare(`
      INSERT INTO jobs (id, sn, job_type, status)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(job.id, job.sn, job.job_type, job.status);
  }

  static findById(id: string): Job | undefined {
    const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
    return stmt.get(id) as Job | undefined;
  }

  static updateStatus(id: string, status: JobStatus, result?: string, error?: string) {
    const stmt = db.prepare(`
      UPDATE jobs 
      SET status = ?, result_json = ?, error_text = ?, finished_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(status, result || null, error || null, id);
  }
}
