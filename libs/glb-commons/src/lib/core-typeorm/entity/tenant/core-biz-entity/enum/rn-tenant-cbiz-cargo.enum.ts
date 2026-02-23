export enum RnTenantCbizCargoType {
  PRODUCT = 'PRODUCT',
  PRODUCT_IN_PROCESS = 'PRODUCT_IN_PROCESS',
  PRODUCT_HALF = 'PRODUCT_HALF',
  MATERIAL = 'MATERIAL',
  SUB_MATERIAL = 'SUB_MATERIAL',
  INCI = 'INCI',
  ETC = 'ETC',
}

export const RnTenantCbizCargoTypeFlag: Record<RnTenantCbizCargoType, number> =
  {
    [RnTenantCbizCargoType.PRODUCT]: 1 << 0, // 0000001 → 1
    [RnTenantCbizCargoType.PRODUCT_IN_PROCESS]: 1 << 1, // 0000010 → 2
    [RnTenantCbizCargoType.PRODUCT_HALF]: 1 << 2, // 0000100 → 4
    [RnTenantCbizCargoType.MATERIAL]: 1 << 3, // 0001000 → 8
    [RnTenantCbizCargoType.SUB_MATERIAL]: 1 << 4, // 0010000 → 16
    [RnTenantCbizCargoType.INCI]: 1 << 5, // 0100000 → 32
    [RnTenantCbizCargoType.ETC]: 1 << 6, // 1000000 → 64
  };
