export class PaginationEntity<T> {
     data: Array<T>;
     total: number

     constructor(data: Partial<PaginationEntity<T>>) {
          Object.assign(this, data)
     }
}