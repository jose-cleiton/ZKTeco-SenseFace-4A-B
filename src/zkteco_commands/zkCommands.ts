// File: src/zkteco_commands/zkCommands.ts

export type ZkPrivilege = 0 | 1 | 2 | 3;
export type ZkBioDataType = 9;

export interface UpdateUserArgs {
  pin: string | number;
  name: string;
  privilege?: ZkPrivilege;
  password?: string;
  cardno?: string | number;
  grp?: string | number;
  tz?: string | number;
}

export interface UpdateFaceArgs {
  pin: string | number;
  faceTemplateBase64: string;
  majorVer?: number;
  minorVer?: number;
  bioDataType?: ZkBioDataType;
}

export interface AuthorizeUserArgs {
  pin: string | number;
  timezone?: number;
}

export interface DeleteUserArgs {
  pin: string | number;
}

function cleanValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function escapeName(name: string): string {
  return name.replace(/[\r\n|]/g, " ").trim();
}

function kv(key: string, value: unknown): string | null {
  const val = cleanValue(value);
  if (!val) return null;
  return `${key}=${val}`;
}

function joinParts(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * DATA UPDATE user
 * Exemplo clássico:
 *   DATA UPDATE user PIN=123 Name=JOSE Privilege=0 Password= CardNo=0 Group=1 TimeZone=1
 */
export function buildUpdateUserCommand(args: UpdateUserArgs): string {
  const PIN = cleanValue(args.pin);
  const Name = escapeName(args.name);

  const parts = [
    "DATA UPDATE user",
    kv("PIN", PIN),
    kv("Name", Name),
    kv("Privilege", args.privilege),
    args.password !== undefined ? `Password=${args.password}` : null,
    kv("CardNo", args.cardno),
    kv("Group", args.grp),
    kv("TimeZone", args.tz),
  ];

  return joinParts(parts);
}

/**
 * DATA UPDATE biodata (face)
 * Exemplo clássico:
 *   DATA UPDATE biodata PIN=123 Type=9 MajorVer=1 MinorVer=0 Tmp=BASE64...
 */
export function buildUpdateFaceCommand(args: UpdateFaceArgs): string {
  const PIN = cleanValue(args.pin);
  const Type = args.bioDataType ?? 9;

  const parts = [
    "DATA UPDATE biodata",
    kv("PIN", PIN),
    kv("Type", Type),
    args.majorVer !== undefined ? kv("MajorVer", args.majorVer) : null,
    args.minorVer !== undefined ? kv("MinorVer", args.minorVer) : null,
    `Tmp=${args.faceTemplateBase64}`,
  ];

  return joinParts(parts);
}

/**
 * DATA UPDATE userauthorize
 * Exemplo comum:
 *   DATA UPDATE userauthorize PIN=123 TimeZone=1
 */
export function buildAuthorizeUserCommand(args: AuthorizeUserArgs): string {
  const PIN = cleanValue(args.pin);
  const tz = args.timezone ?? 1;

  const parts = [
    "DATA UPDATE userauthorize",
    kv("PIN", PIN),
    kv("TimeZone", tz),
  ];

  return joinParts(parts);
}

/**
 * DATA DELETE user
 * Exemplo:
 *   DATA DELETE user PIN=123
 */
export function buildDeleteUserCommand(args: DeleteUserArgs): string {
  const PIN = cleanValue(args.pin);
  return joinParts(["DATA DELETE user", kv("PIN", PIN)]);
}

/**
 * DATA QUERY user
 * - Lista todos: DATA QUERY user
 * - Por PIN:      DATA QUERY user PIN=123
 */
export function buildQueryUsersCommand(): string {
  return "DATA QUERY user";
}

export function buildQueryUserByPinCommand(pin: string | number): string {
  const PIN = cleanValue(pin);
  return joinParts(["DATA QUERY user", kv("PIN", PIN)]);
}

/**
 * Extras úteis (opcionais)
 */
export function buildQueryUserInfoCommand(): string {
  return "DATA QUERY USERINFO";
}

export function buildDeleteUserInfoCommand(pin: string | number): string {
  const PIN = cleanValue(pin);
  return joinParts(["DATA DELETE USERINFO", kv("PIN", PIN)]);
}
