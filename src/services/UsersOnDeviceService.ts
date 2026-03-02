import { 
  buildQueryUsersCommand, 
  buildQueryUserByPinCommand, 
  buildUpdateUserCommand, 
  buildDeleteUserCommand,
  buildUpdateFaceCommand,
  buildAuthorizeUserCommand,
  UpdateUserArgs
} from '../zkteco_commands/zkCommands.ts';
import { CommandService } from './CommandService.ts';
import { JobService } from './JobService.ts';
import dotenv from 'dotenv';

dotenv.config();
const TIMEOUT = parseInt(process.env.COMMAND_TIMEOUT_SECONDS || '12');

export class UsersOnDeviceService {
  static async listUsers(sn: string) {
    const jobId = await JobService.createJob(sn, 'QUERY_USERS');
    await CommandService.enqueue(sn, buildQueryUsersCommand(), jobId);
    return JobService.waitForJob(jobId, TIMEOUT);
  }

  static async getUser(sn: string, pin: string) {
    const jobId = await JobService.createJob(sn, 'QUERY_USER');
    await CommandService.enqueue(sn, buildQueryUserByPinCommand(pin), jobId);
    return JobService.waitForJob(jobId, TIMEOUT);
  }

  static async upsertUser(sn: string, args: UpdateUserArgs) {
    const jobId = await JobService.createJob(sn, 'UPDATE_USER');
    await CommandService.enqueue(sn, buildUpdateUserCommand(args), jobId);
    return JobService.waitForJob(jobId, TIMEOUT);
  }

  static async deleteUser(sn: string, pin: string) {
    const jobId = await JobService.createJob(sn, 'DELETE_USER');
    await CommandService.enqueue(sn, buildDeleteUserCommand({ pin }), jobId);
    return JobService.waitForJob(jobId, TIMEOUT);
  }

  static async upsertUserWithFace(sn: string, data: any) {
    const jobId = await JobService.createJob(sn, 'UPDATE_USER_WITH_FACE');
    
    // Enqueue sequence
    await CommandService.enqueue(sn, buildUpdateUserCommand({
      pin: data.pin,
      name: data.name,
      privilege: data.privilege,
      password: data.password,
      cardno: data.cardno,
      grp: data.grp,
      tz: data.tz
    }), jobId);

    await CommandService.enqueue(sn, buildUpdateFaceCommand({
      pin: data.pin,
      faceTemplateBase64: data.face_template_base64,
      majorVer: data.majorVer,
      minorVer: data.minorVer
    }), jobId);

    await CommandService.enqueue(sn, buildAuthorizeUserCommand({
      pin: data.pin,
      timezone: data.timezone
    }), jobId);

    return JobService.waitForJob(jobId, TIMEOUT);
  }
}
