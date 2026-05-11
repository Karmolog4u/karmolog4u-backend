export function trimEmailDomain(email: string, domain = '@mail.com'): string {
  if (!email || typeof email !== 'string') return '';
  if (email.endsWith(domain)) {
    return email.slice(0, -domain.length);
  }
  return email;
}

export function trimAnyEmailDomain(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const at = email.indexOf('@');
  return at === -1 ? email : email.slice(0, at);
}
