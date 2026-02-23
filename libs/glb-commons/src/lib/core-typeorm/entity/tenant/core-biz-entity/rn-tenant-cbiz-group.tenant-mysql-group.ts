/* eslint-disable @typescript-eslint/no-explicit-any */
import { RnTenantCbizBizHolidayEntity } from './entity/rn-tenant-cbiz-biz-holiday.tenant-mysql-entity';
import { RnTenantCbizBizPartnerHistoryEntity } from './entity/rn-tenant-cbiz-biz-partner-history.tenant-mysql-entity';
import { RnTenantCbizBizPartnerMngHistoryEntity } from './entity/rn-tenant-cbiz-biz-partner-mng-history.tenant-mysql-entity';
import { RnTenantCbizBizPartnerMngMatchEntity } from './entity/rn-tenant-cbiz-biz-partner-mng-match.tenant-mysql-entity';
import { RnTenantCbizBizPartnerManagerEntity } from './entity/rn-tenant-cbiz-biz-partner-mng.tenant-mysql-entity';
import { RnTenantCbizBizPartnerEntity } from './entity/rn-tenant-cbiz-biz-partner.tenant-mysql-entity';
import { RnTenantCbizCargoHistoryEntity } from './entity/rn-tenant-cbiz-cargo-history.tenant-mysql-entity';
import { RnTenantCbizCargoEntity } from './entity/rn-tenant-cbiz-cargo.tenant-mysql-entity';
import { RnTenantCbizCodeGroupHistoryEntity } from './entity/rn-tenant-cbiz-code-group-history.tenant-mysql-entity';
import { RnTenantCbizCodeGroupEntity } from './entity/rn-tenant-cbiz-code-group.tenant-mysql-entity';
import { RnTenantCbizCodeHistoryEntity } from './entity/rn-tenant-cbiz-code-history.tenant-mysql-entity';
import { RnTenantCbizCodeEntity } from './entity/rn-tenant-cbiz-code.tenant-mysql-entity';
import { RnTenantCbizCompanyDefaultEntity } from './entity/rn-tenant-cbiz-company-default.tenant-mysql-entity';
import { RnTenantCbizConfigEntity } from './entity/rn-tenant-cbiz-config.tenant-mysql-entity';
import { RnTenantCbizEmployeeDeptHistoryEntity } from './entity/rn-tenant-cbiz-employee-dept-history.tenant-mysql-entity';
import { RnTenantCbizEmployeeDeptEntity } from './entity/rn-tenant-cbiz-employee-dept.tenant-mysql-entity';
import { RnTenantCbizEmployeeHistoryEntity } from './entity/rn-tenant-cbiz-employee-history.tenant-mysql-entity';
import { RnTenantCbizEmployeeMappingAccountEntity } from './entity/rn-tenant-cbiz-employee-mapping-account.tenant-mysql-entity';
import { RnTenantCbizEmployeeTeamHistoryEntity } from './entity/rn-tenant-cbiz-employee-team-history.tenant-mysql-entity';
import { RnTenantCbizEmployeeTeamEntity } from './entity/rn-tenant-cbiz-employee-team.tenant-mysql-entity';
import { RnTenantCbizEmployeeEntity } from './entity/rn-tenant-cbiz-employee.tenant-mysql-entity';
import { RnTenantCbizFacilityHistoryEntity } from './entity/rn-tenant-cbiz-facility-history.tenant-mysql-entity';
import { RnTenantCbizFacilityEntity } from './entity/rn-tenant-cbiz-facility.tenant-mysql-entity';
import { RnTenantCbizInciFormulaHistoryEntity } from './entity/rn-tenant-cbiz-inci-formula-history.tenant-mysql-entity';
import { RnTenantCbizInciGroupHistoryEntity } from './entity/rn-tenant-cbiz-inci-group-history.tenant-mysql-entity';
import { RnTenantCbizInciGroupEntity } from './entity/rn-tenant-cbiz-inci-group.tenant-mysql-entity';
import { RnTenantCbizInciHistoryEntity } from './entity/rn-tenant-cbiz-inci-history.tenant-mysql-entity';
import { RnTenantCbizInciMatchingIngredientDetailEntity } from './entity/rn-tenant-cbiz-inci-matching-ingredient-detail.tenant-mysql-entity';
import { RnTenantCbizInciMatchingIngredientEntity } from './entity/rn-tenant-cbiz-inci-matching-ingredient.tenant-mysql-entity';
import { RnTenantCbizInciPriceHistoryEntity } from './entity/rn-tenant-cbiz-inci-price-history.tenant-mysql-entity';
import { RnTenantCbizInciPriceUnitHistoryEntity } from './entity/rn-tenant-cbiz-inci-price-unit-history.tenant-mysql-entity';
import { RnTenantCbizInciPriceEntity } from './entity/rn-tenant-cbiz-inci-price.tenant-mysql-entity';
import { RnTenantCbizInciSupHistoryEntity } from './entity/rn-tenant-cbiz-inci-sup-history.tenant-mysql-entity';
import { RnTenantCbizInciSupEntity } from './entity/rn-tenant-cbiz-inci-sup.tenant-mysql-entity';
import { RnTenantCbizInciEntity } from './entity/rn-tenant-cbiz-inci.tenant-mysql-entity';
import { RnTenantCbizMaterialFormulaHistoryEntity } from './entity/rn-tenant-cbiz-material-formula-history.tenant-mysql-entity';
import { RnTenantCbizMaterialGroupHistoryEntity } from './entity/rn-tenant-cbiz-material-group-history.tenant-mysql-entity';
import { RnTenantCbizMaterialGroupEntity } from './entity/rn-tenant-cbiz-material-group.tenant-mysql-entity';
import { RnTenantCbizMaterialHistoryEntity } from './entity/rn-tenant-cbiz-material-history.tenant-mysql-entity';
import { RnTenantCbizMaterialPriceUnitHistoryEntity } from './entity/rn-tenant-cbiz-material-price-unit-history.tenant-mysql-entity';
import { RnTenantCbizMaterialEntity } from './entity/rn-tenant-cbiz-material.tenant-mysql-entity';
import { RnTenantCbizMenuEntity } from './entity/rn-tenant-cbiz-menu.tenant-mysql-entity';
import { RnTenantCbizProductFormulaHistoryEntity } from './entity/rn-tenant-cbiz-product-formula-history.tenant-mysql-entity';
import { RnTenantCbizProductGroupHistoryEntity } from './entity/rn-tenant-cbiz-product-group-history.tenant-mysql-entity';
import { RnTenantCbizProductGroupEntity } from './entity/rn-tenant-cbiz-product-group.tenant-mysql-entity';
import { RnTenantCbizProductHistoryEntity } from './entity/rn-tenant-cbiz-product-history.tenant-mysql-entity';
import { RnTenantCbizProductManufactureHistoryEntity } from './entity/rn-tenant-cbiz-product-manufacture-history.tenant-mysql-entity';
import { RnTenantCbizProductManufactureInciEntity } from './entity/rn-tenant-cbiz-product-manufacture-inci.tenant-mysql-entity';
import { RnTenantCbizProductManufactureProcUnitInciEntity } from './entity/rn-tenant-cbiz-product-manufacture-proc-unit-inci.tenant-mysql-entity';
import { RnTenantCbizProductManufactureProcUnitEntity } from './entity/rn-tenant-cbiz-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizProductManufactureProcEntity } from './entity/rn-tenant-cbiz-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizProductManufactureEntity } from './entity/rn-tenant-cbiz-product-manufacture.tenant-mysql-entity';
import { RnTenantCbizProductPriceUnitHistoryEntity } from './entity/rn-tenant-cbiz-product-price-unit-history.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './entity/rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizResearchNoteEntity } from './entity/rn-tenant-cbiz-research-note.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureHistoryEntity } from './entity/rn-tenant-cbiz-research-product-manufacture-history.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureInciEntity } from './entity/rn-tenant-cbiz-research-product-manufacture-inci.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureProcUnitInciEntity } from './entity/rn-tenant-cbiz-research-product-manufacture-proc-unit-inci.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureProcUnitEntity } from './entity/rn-tenant-cbiz-research-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureProcEntity } from './entity/rn-tenant-cbiz-research-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureEntity } from './entity/rn-tenant-cbiz-research-product-manufacture.tenant-mysql-entity';
import { RnTenantCbizSalesEstimateProductEntity } from './entity/rn-tenant-cbiz-sales-estimate-product.tenant-mysql-entity';
import { RnTenantCbizSalesEstimateEntity } from './entity/rn-tenant-cbiz-sales-estimate.tenant-mysql-entity';
import { RnTenantCbizSalesOrderProductEntity } from './entity/rn-tenant-cbiz-sales-order-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderEntity } from './entity/rn-tenant-cbiz-sales-order.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureHistoryEntity } from './entity/rn-tenant-cbiz-sales-product-manufacture-history.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureInciEntity } from './entity/rn-tenant-cbiz-sales-product-manufacture-inci.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcUnitInciEntity } from './entity/rn-tenant-cbiz-sales-product-manufacture-proc-unit-inci.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcUnitEntity } from './entity/rn-tenant-cbiz-sales-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcEntity } from './entity/rn-tenant-cbiz-sales-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureEntity } from './entity/rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';
import { RnTenantCbizSalesProductEntity } from './entity/rn-tenant-cbiz-sales-product.tenant-mysql-entity';
import { RnTenantCbizSelfProductOrderEntity } from './entity/rn-tenant-cbiz-self-product-order.tenant-mysql-entity';
import { RnTenantCbizShipmentEntity } from './entity/rn-tenant-cbiz-shipment.tenant-mysql-entity';
import { RnTenantCbizStockHistoryEntity } from './entity/rn-tenant-cbiz-stock-history.tenant-mysql-entity';
import { RnTenantCbizStockReservationEntity } from './entity/rn-tenant-cbiz-stock-reservation.tenant-mysql-entity';
import { RnTenantCbizStockEntity } from './entity/rn-tenant-cbiz-stock.tenant-mysql-entity';
import { RnTenantCbizWorksheetScheduleEntity } from './entity/rn-tenant-cbiz-worksheet-schedule.teant-mysql-entity';
import { RnTenantCbizWorksheetStopEntity } from './entity/rn-tenant-cbiz-worksheet-stop.tenant-mysql-entity';
import { RnTenantCbizWorksheetWaitEntity } from './entity/rn-tenant-cbiz-worksheet-wait.tenant-mysql-entity';
import { RnTenantCbizWorksheetEntity } from './entity/rn-tenant-cbiz-worksheet.tenant-mysql-entity';
/**
 * 핵심 비즈니스 엔티티 그룹
 */
export const CBIZ_GROUP_ENTITY: any[] = [
  // 설정
  RnTenantCbizConfigEntity,

  // 직원 관리
  RnTenantCbizEmployeeEntity,
  RnTenantCbizEmployeeMappingAccountEntity,
  RnTenantCbizEmployeeHistoryEntity,

  // 부서 관리
  RnTenantCbizEmployeeDeptEntity,
  RnTenantCbizEmployeeTeamHistoryEntity,

  // 팀 관리
  RnTenantCbizEmployeeTeamEntity,
  RnTenantCbizEmployeeDeptHistoryEntity,

  // 메뉴
  RnTenantCbizMenuEntity,

  // 창고 관리
  RnTenantCbizCargoEntity,
  RnTenantCbizCargoHistoryEntity,

  // 공통코드 관리
  RnTenantCbizCodeGroupEntity,
  RnTenantCbizCodeGroupHistoryEntity,
  RnTenantCbizCodeEntity,
  RnTenantCbizCodeHistoryEntity,

  // 거래처 관리
  RnTenantCbizBizPartnerEntity,
  RnTenantCbizBizPartnerManagerEntity,
  RnTenantCbizBizPartnerMngMatchEntity,
  RnTenantCbizBizPartnerHistoryEntity,
  RnTenantCbizBizPartnerMngHistoryEntity,

  // 원료 관리
  RnTenantCbizInciEntity,
  RnTenantCbizInciHistoryEntity,
  RnTenantCbizInciGroupEntity,
  RnTenantCbizInciGroupHistoryEntity,
  RnTenantCbizInciPriceEntity,
  RnTenantCbizInciPriceHistoryEntity,
  RnTenantCbizInciPriceUnitHistoryEntity,
  RnTenantCbizInciSupEntity,
  RnTenantCbizInciSupHistoryEntity,
  RnTenantCbizInciFormulaHistoryEntity,
  RnTenantCbizInciMatchingIngredientEntity,
  RnTenantCbizInciMatchingIngredientDetailEntity,

  // 회사 기본 정보
  RnTenantCbizCompanyDefaultEntity,

  // 휴일 관리
  RnTenantCbizBizHolidayEntity,

  // 설비 관리
  RnTenantCbizFacilityEntity,
  RnTenantCbizFacilityHistoryEntity,

  // 자재 관리
  RnTenantCbizMaterialEntity,
  RnTenantCbizMaterialGroupEntity,
  RnTenantCbizMaterialGroupHistoryEntity,
  RnTenantCbizMaterialHistoryEntity,
  RnTenantCbizMaterialPriceUnitHistoryEntity,
  RnTenantCbizMaterialFormulaHistoryEntity,

  // 제품
  RnTenantCbizProductEntity,
  RnTenantCbizProductGroupEntity,
  RnTenantCbizProductGroupHistoryEntity,
  RnTenantCbizProductHistoryEntity,
  RnTenantCbizProductPriceUnitHistoryEntity,
  RnTenantCbizProductFormulaHistoryEntity,

  // 제품 제조
  RnTenantCbizProductManufactureEntity,
  RnTenantCbizProductManufactureHistoryEntity,
  RnTenantCbizProductManufactureProcEntity,
  RnTenantCbizProductManufactureProcUnitEntity,
  RnTenantCbizProductManufactureInciEntity,
  RnTenantCbizProductManufactureProcUnitInciEntity,

  // 연구 제품 제조
  RnTenantCbizResearchNoteEntity,
  RnTenantCbizResearchProductManufactureEntity,
  RnTenantCbizResearchProductManufactureHistoryEntity,
  RnTenantCbizResearchProductManufactureProcEntity,
  RnTenantCbizResearchProductManufactureProcUnitEntity,
  RnTenantCbizResearchProductManufactureInciEntity,
  RnTenantCbizResearchProductManufactureProcUnitInciEntity,

  // 견적 관리
  RnTenantCbizSalesEstimateEntity,
  RnTenantCbizSalesEstimateProductEntity,

  // 수주 관리
  RnTenantCbizSalesOrderEntity,
  RnTenantCbizSalesOrderProductEntity,

  // 판매 제품 제조
  RnTenantCbizSalesProductManufactureEntity,
  RnTenantCbizSalesProductManufactureHistoryEntity,
  RnTenantCbizSalesProductManufactureProcEntity,
  RnTenantCbizSalesProductManufactureProcUnitEntity,
  RnTenantCbizSalesProductManufactureInciEntity,
  RnTenantCbizSalesProductManufactureProcUnitInciEntity,
  RnTenantCbizSalesProductEntity,

  // 자체 제품 수주
  RnTenantCbizSelfProductOrderEntity,

  // 재고
  RnTenantCbizStockEntity,
  RnTenantCbizStockHistoryEntity,
  RnTenantCbizStockReservationEntity,

  // 생산
  RnTenantCbizWorksheetEntity,
  RnTenantCbizWorksheetScheduleEntity,
  RnTenantCbizWorksheetStopEntity,
  RnTenantCbizWorksheetWaitEntity,

  // 출고
  RnTenantCbizShipmentEntity,
];
