/* eslint-disable no-redeclare */
import { Spin, Table as AntTable } from "ant-design-vue";
import { VCProps, VueComponent2, getPropsClass } from "@antv-plus2/helper";
import { PaginationConfig as AntPaginationConfig } from "ant-design-vue/types/table/table";
import { Column, IColumnProps } from "./column";
export interface ITableProps<T = any>
  extends Pick<
    VCProps<AntTable, false>,
    Exclude<keyof VCProps<AntTable>, "dataSource" | "columns" | "rowKey" | "loading">
  > {
  /**
   * 表格加载中状态
   * @default false
   */
  loading?: boolean | VCProps<Spin, false>;
  columns: IColumnProps<T>[];
  dataSource?: T[];
  rowKey?: string | ((row: T, index: number) => string);
}
export interface PaginationConfig extends VCProps<Omit<AntPaginationConfig, "itemRender">, false> {}
export interface ITableEvents {
  change?(
    pagination?: PaginationConfig,
    filters?: any,
    sorter?: any,
    state?: { currentDataSource: any[] }
  ): void;
}
export interface ITableScopedSlots {
  [key: string]: any;
}
export interface ITablePublicMembers {}

export const Table = AntTable as VueComponent2<
  ITableProps,
  ITableEvents,
  ITableScopedSlots,
  ITablePublicMembers,
  typeof AntTable & {
    Column: typeof Column;
  }
>;
export interface Table extends InstanceType<typeof Table> {}

export const TableProps = getPropsClass(AntTable as unknown as VueComponent2<ITableProps>, {});

export { AntTable };
export type { IColumnProps };
