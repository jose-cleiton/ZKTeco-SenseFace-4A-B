export function getNowSqlite(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

export function isOnline(lastSeen: string, onlineSeconds: number): boolean {
  const last = new Date(lastSeen).getTime();
  const now = new Date().getTime();
  return (now - last) / 1000 < onlineSeconds;
}
