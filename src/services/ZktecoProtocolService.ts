import { LogService } from './LogService.ts';
import { CommandService } from './CommandService.ts';
import { JobService } from './JobService.ts';
import { CommandRepository } from '../repositories/CommandRepository.ts';
import { parseQueryResponse } from '../utils/parsers.ts';
import pino from 'pino';

const logger = pino();

export class ZktecoProtocolService {
  static async handleCdataPost(sn: string, table: string, body: string) {
    logger.info({ sn, table }, 'Handling CDATA POST');

    if (table === 'rtlog') {
      await LogService.processRtLog(sn, body);
      return 'OK';
    }

    // Handle data query responses sent via CDATA (some firmwares)
    if (table.startsWith('data:')) {
      const dataType = table.split(':')[1];
      // Check if this is a response to a job
      // In ZK protocol, sometimes the response doesn't explicitly link to a command ID in CDATA
      // but we can try to find the last pending job for this SN that was a query
      // However, a better way is to look for the command ID if provided in headers or body
      // For now, let's assume we need to correlate via SN and Type
      const parsed = parseQueryResponse(body);
      logger.info({ sn, dataType, count: parsed.length }, 'Parsed query response from CDATA');
      // This is complex without explicit ID, but we'll handle it in devicecmd if possible
    }

    return 'OK';
  }

  static async handleDeviceCmd(sn: string, body: string) {
    // Body format usually: ID=1&Return=0&CMD=DATA QUERY user...
    const parts = new URLSearchParams(body);
    const id = parts.get('ID');
    const ret = parts.get('Return');
    
    if (!id) return 'OK';

    const cmdId = await CommandService.handleAck(sn, id, body);
    if (cmdId) {
      const cmd = CommandRepository.findByJobId(''); // This is just a placeholder
      // We need to find the command by its actual ID to get the job_id
      const stmt = require('../repositories/db.ts').default.prepare('SELECT * FROM commands WHERE id = ?');
      const fullCmd = stmt.get(cmdId);
      
      if (fullCmd && fullCmd.job_id) {
        // If it was a query, the data might be in the body or we might need to wait for CDATA
        // Usually for DATA QUERY, the data follows the ACK or is in the ACK body
        if (fullCmd.command_text.includes('DATA QUERY')) {
          const resultData = parseQueryResponse(body);
          await JobService.finishJob(fullCmd.job_id, 'done', resultData);
        } else {
          // For updates/deletes, Return=0 means success
          if (ret === '0') {
            // Check if there are more commands for this job
            const jobCmds = CommandRepository.findByJobId(fullCmd.job_id);
            const allDone = jobCmds.every(c => c.status === 2);
            if (allDone) {
              await JobService.finishJob(fullCmd.job_id, 'done', { message: 'Success' });
            }
          } else {
            await JobService.finishJob(fullCmd.job_id, 'failed', undefined, `Device returned error: ${ret}`);
          }
        }
      }
    }

    return 'OK';
  }
}
