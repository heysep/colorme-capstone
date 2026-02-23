export enum RnTenantCbizSelfProductOrderStatusType {
  // 대기
  WAITING = 'WAITING',
  // 생산 대기
  PRODUCTION_WAIT = 'PRODUCTION_WAIT',
  // 생산
  PRODUCTION = 'PRODUCTION',
  // 부분 생산
  PARTIAL_PRODUCTION = 'PARTIAL_PRODUCTION',
  // 출고 대기
  SHIPMENT_WAIT = 'SHIPMENT_WAIT',
  // 부분 출고
  PARTIAL_SHIPMENT = 'PARTIAL_SHIPMENT',
  // 출고
  SHIPMENT = 'SHIPMENT',
  // 폐기
  DISCARD = 'DISCARD',
}
