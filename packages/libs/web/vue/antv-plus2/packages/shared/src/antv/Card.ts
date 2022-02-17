/* eslint-disable no-redeclare */
// @ts-nocheck
import { Card as AntCard } from "ant-design-vue";
import { VCProps, VueComponent2 } from "@antv-plus2/helper";

export interface ICardProps extends VCProps<AntCard, false> {}
export interface ICardEvents {}
export interface ICardScopedSlots {}
export interface ICardPublicMembers {}

export const Card = AntCard as unknown as VueComponent2<
  ICardProps,
  ICardEvents,
  ICardScopedSlots,
  ICardPublicMembers,
  typeof AntCard
>;
export interface Card extends InstanceType<typeof Card> {}

export { AntCard };
