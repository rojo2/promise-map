export class PromiseMap {
  get size(): number;
  has(id: any): boolean;
  get(id: any): Promise<any>;
  resolve(id: any, payload: any): void;
  reject(id: any, payload: any): void;
  cancel(id: any): void;
  resolveAll(payload: any): void;
  rejectAll(payload: any): void;
  cancelAll(): void;
}

export default PromiseMap;
