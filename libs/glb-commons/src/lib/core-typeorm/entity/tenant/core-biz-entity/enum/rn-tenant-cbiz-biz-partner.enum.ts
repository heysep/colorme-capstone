export enum RnTenantCbizBizPartnerType {
  VNDR = 'VNDR',
  SUP = 'SUP',
  CS = 'CS',
}

export const RnTenantCbizBizPartnerTypeFlag: Record<
  RnTenantCbizBizPartnerType,
  number
> = {
  [RnTenantCbizBizPartnerType.VNDR]: 1 << 0, // 001 → 1
  [RnTenantCbizBizPartnerType.SUP]: 1 << 1, // 010 → 2
  [RnTenantCbizBizPartnerType.CS]: 1 << 2, // 100 → 4
};
