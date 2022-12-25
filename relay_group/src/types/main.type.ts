export interface TableDatum {
  [key: string]: string | number
}

export interface Group {
  id: string;
  name: string;
  data: TableDatum[];
  /** 用來平衡每個分組總數的替身 */
  substitutes: TableDatum[];
}