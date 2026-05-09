import type { ApiResponse } from '@/types/api/common.type'

export function ok<T>(data: T): ApiResponse<T> {
  return { data, success: true }
}
