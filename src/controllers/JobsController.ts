import { Request, Response } from 'express';
import { JobService } from '../services/JobService.ts';

export class JobsController {
  static async get(req: Request, res: Response) {
    const { jobId } = req.params;
    const job = JobService.getJob(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    res.json({
      ...job,
      result: job.result_json ? JSON.parse(job.result_json) : null
    });
  }
}
