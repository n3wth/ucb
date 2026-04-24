export interface StartEndInput {
  showDate: string
  showTime: string
  durationMinutes: number
}

export function computeStartEnd(d: StartEndInput): { startISO: string; endISO: string } {
  const startISO = `${d.showDate}T${d.showTime}:00`
  const start = new Date(startISO)
  const end = new Date(start.getTime() + d.durationMinutes * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  const endISO = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:00`
  return { startISO, endISO }
}
