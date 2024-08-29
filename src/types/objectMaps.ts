import { FilterByOptions, FilterOptionsKeywords } from '@/types/interfaces'

export const filterTypeToButtonIndexMap: Record<string, number> = {
  [FilterOptionsKeywords.CLIENTS]: 2,
  [FilterOptionsKeywords.TEAM]: 1,
  '': 3,
}

export const filterOptionsMap: Record<string, FilterByOptions> = {
  [FilterOptionsKeywords.CLIENTS]: FilterByOptions.CLIENT,
  [FilterOptionsKeywords.TEAM]: FilterByOptions.IUS,
}
