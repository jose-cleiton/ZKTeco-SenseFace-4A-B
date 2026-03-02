import { CommandRepository, CommandStatus } from '../repositories/CommandRepository.ts';
import pino from 'pino';

const logger = pino();

export class CommandService {
  static async enqueue(sn: string, commandText: string, jobId?: string) {
    logger.info({ sn, commandText, jobId }, 'Enqueuing command');
    return CommandRepository.create({ sn, command_text: commandText, job_id: jobId });
  }

  static async getNext(sn: string) {
    const cmd = CommandRepository.getNextPending(sn);
    if (cmd && cmd.id) {
      CommandRepository.markAsSent(cmd.id);
    }
    return cmd;
  }

  static async handleAck(sn: string, cmdIdStr: string, response: string) {
    const cmdId = parseInt(cmdIdStr.replace('ID=', ''));
    if (isNaN(cmdId)) return;

    logger.info({ sn, cmdId, response }, 'Received command ACK');
    
    if (response.toUpperCase().includes('OK')) {
      CommandRepository.markAsAcked(cmdId, response);
    } else {
      CommandRepository.markAsFailed(cmdId, response);
    }
    
    return cmdId;
  }
}
