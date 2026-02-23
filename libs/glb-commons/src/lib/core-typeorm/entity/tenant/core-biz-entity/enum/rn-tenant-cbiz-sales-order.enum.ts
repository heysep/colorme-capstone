export enum RnTenantCbizSalesOrderStatusType {
  // 대기
  WAITING = 'WAITING',
  // 부분 수주
  PARTIAL_SALES_ORDER = 'PARTIAL_SALES_ORDER',
  // 수주
  SALES_ORDER = 'SALES_ORDER',
  // 생산 대기
  PRODUCTION_WAIT = 'PRODUCTION_WAIT',
  // 부분 생산
  PARTIAL_PRODUCTION = 'PARTIAL_PRODUCTION',
  // 생산
  PRODUCTION = 'PRODUCTION',
  // 부분 출고
  PARTIAL_SHIPMENT = 'PARTIAL_SHIPMENT',
  // 출고
  SHIPMENT = 'SHIPMENT',
  // 폐기
  DISCARD = 'DISCARD',
}

export enum RnTenantCbizSalesOrderUrgentType {
  // 긴급
  URGENT = 'URGENT',
  // 초긴급
  SUPER_URGENT = 'SUPER_URGENT',
  // 보통
  NORMAL = 'NORMAL',
}

export enum RnTenantCbizSalesOrderProductStatusType {
  //대기
  WAITING = 'WAITING',
  // 수주
  SALES_ORDER = 'SALES_ORDER',
  // 생산대기
  PRODUCTION_WAIT = 'PRODUCTION_WAIT',
  // 생산
  PRODUCTION = 'PRODUCTION',
  // 부분 출고
  PARTIAL_SHIPMENT = 'PARTIAL_SHIPMENT',
  // 출고
  SHIPMENT = 'SHIPMENT',
  // 패기
  DISCARD = 'DISCARD',
}

export enum RnTenantCbizSalesOrderProductSampleType {
  // 샘플
  SAMPLE = 'SAMPLE',
  // 양산
  PRODUCTION = 'PRODUCTION',
}

export enum RnTenantCbizSalesOrderProductExportType {
  // 수출
  EXPORT = 'EXPORT',
  // 내수
  INTERNAL = 'INTERNAL',
}

export enum RnTenantCbizSalesOrderProductFreeType {
  // 무상
  FREE = 'FREE',
  // 유상
  PAID = 'PAID',
}
