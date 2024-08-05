import { z } from 'zod'

export const HexColorSchema = z.string().refine((val) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val), {
  message: 'Invalid hex color code',
})
