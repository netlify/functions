export interface ObjectDescription {
  lastModified: string
  key: string
}
export interface ListResponse<T = any> {
  count: number
  objects: Array<ObjectDescription>
}
export interface Store {
  get<T = any>(key: string): Promise<T>
  set<T = any>(key: string, value: T): Promise<boolean>
  delete(key: string): Promise<boolean>
  list(prefix: string): Promise<ListResponse>
  patch<T extends Record<string, any>>(key: string, value: Partial<T>): Promise<T>
}

export function getStore(context: HandlerContext): Store
