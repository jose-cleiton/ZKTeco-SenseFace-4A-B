import { JobRepository, JobStatus, Job } from '../repositories/JobRepository.ts';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';

const logger = pino();

// In-memory map for temporary waiters
const waiters = new Map<string, (result: any) => void>();

export class JobService {
  static async createJob(sn: string, type: string): Promise<string> {
    const id = uuidv4();
    JobRepository.create({ id, sn, job_type: type, status: 'pending' });
    return id;
  }

  static async waitForJob(jobId: string, timeoutSeconds: number): Promise<Job | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        waiters.delete(jobId);
        const job = JobRepository.findById(jobId);
        if (job && job.status === 'pending') {
          JobRepository.updateStatus(jobId, 'timeout', undefined, 'Request timed out');
        }
        resolve(JobRepository.findById(jobId) || null);
      }, timeoutSeconds * 1000);

      waiters.set(jobId, (result) => {
        clearTimeout(timeout);
        waiters.delete(jobId);
        resolve(result);
      });
    });
  }

  static async finishJob(jobId: string, status: JobStatus, result?: any, error?: string) {
    const resultStr = result ? JSON.stringify(result) : undefined;
    JobRepository.updateStatus(jobId, status, resultStr, error);
    
    const waiter = waiters.get(jobId);
    if (waiter) {
      const updatedJob = JobRepository.findById(jobId);
      waiter(updatedJob);
    }
  }

  static getJob(jobId: string) {
    return JobRepository.findById(jobId);
  }
}
