const now = new Date();

export function getAMZDate(): string {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');

  return amzDate;
}
