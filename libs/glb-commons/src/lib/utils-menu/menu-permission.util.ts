import { RnTenantPermissionAccess } from '../core-acl/decorator/permission.decorator';
import { MenuNm } from './menu-default-tree.util';

/**
 * 권한을 생성하기 위한 CRUD 여부 인터페이스
 */
export interface IPermissionGenType {
  read: boolean;
  update: boolean;
  delete: boolean;
  create: boolean;
}

// -----------------------------------------
// 권한 상수 데이터
// -----------------------------------------
const READ_ONLY: IPermissionGenType = {
  read: true,
  update: false,
  delete: false,
  create: false,
};
const ALL_PERMISSION: IPermissionGenType = {
  read: true,
  update: true,
  delete: true,
  create: true,
};
// -----------------------------------------

/**
 * 메뉴를 사용하기 필요한 기본 정보 관련 권한 리스트
 */
export const menuDefaultPermission: Partial<{
  [key in RnTenantPermissionAccess]: IPermissionGenType;
}> = {
  // ----------------------------
  // AUTH 관련 권한
  // ----------------------------
  [RnTenantPermissionAccess.SERV_AUTH_ROLE_AND_PERMISSION_MNG]: READ_ONLY,
  [RnTenantPermissionAccess.SERV_AUTH_USER_TEAM_MNG]: READ_ONLY,
  [RnTenantPermissionAccess.SERV_AUTH_USER_MNG]: READ_ONLY,
  // ----------------------------

  // ----------------------------
  // 기초 정보 권한
  // ----------------------------
  // ** 회사 기본 정보 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_COMPANY_DEFAULT]: READ_ONLY,
  // ** 거래처 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: READ_ONLY,
  // ** 거래처 담당자 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: READ_ONLY,
  // ** 공정 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PROCESS]: READ_ONLY,
  // ** 공정 그룹 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PROCESS_GROUP]: READ_ONLY,
  // ** 공정 공급처 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PROCESS_VENDOR]: READ_ONLY,
  // ** 공정 불량 종류 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PROCESS_BAD]: READ_ONLY,
  // ** 공정 불량 그룹 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PROCESS_BAD_GROUP]: READ_ONLY,
  // ** 공정 공급처 가격 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PROCESS_VENDOR_PRICE]: READ_ONLY,
  // ** 원판정보 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_BOARD]: READ_ONLY,
  // ** 원판그룹정보 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_BOARD_GROUP]: READ_ONLY,
  // ** 적층구조 요소 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_LAMINATION_SOURCE]: READ_ONLY,
  // ** 부서 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_DEPT]: READ_ONLY,
  // ** 팀 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_TEAM]: READ_ONLY,
  // ** 휴일 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_OFFDAY]: READ_ONLY,
  // ** 공통코드 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_COMMON_CODE]: READ_ONLY,
  // ** 공통코드 그룹 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_COMMON_CODE_GROUP]: READ_ONLY,
  // ** 제품군 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PRODUCT_LINES]: READ_ONLY,
  // ** 제품군 그룹 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_PRODUCT_LINES_GROUP]: READ_ONLY,
  // ** 원자재 그룹 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_MATERIAL_GROUP]: READ_ONLY,
  // ** 원자재 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_MATERIAL]: READ_ONLY,
  // ** 원자재 가격 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_MATERIAL_PRICE]: READ_ONLY,
  // ** 원자재 구매처 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_MATERIAL_SUP]: READ_ONLY,
  // ** 원자재 그룹 불량 종류 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_MATERIAL_GROUP_BAD]: READ_ONLY,
  // ** 원자재 그룹 불량 그룹 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_MATERIAL_GROUP_BAD_GROUP]: READ_ONLY,
  // ** 기본 메타데이터 관리
  [RnTenantPermissionAccess.SERV_BASEINFO_DEFAULT_METADATA]: READ_ONLY,
  // ----------------------------

  // ----------------------------
  // 계시판
  // ----------------------------
  // ** 버그 픽스 계시판
  [RnTenantPermissionAccess.SERV_UTILITY_BOARD_BUGFIX]: ALL_PERMISSION,
  // ----------------------------

  // ----------------------------
  // 메모
  // ----------------------------
  // ** 공용 메모
  [RnTenantPermissionAccess.SERV_CORE_D3_GLOBAL_MEMO]: ALL_PERMISSION,
  // ** 개인 메모
  [RnTenantPermissionAccess.SERV_CORE_D3_PERSONAL_MEMO]: ALL_PERMISSION,
};

// menuTypeEm이 PAGE인 메뉴의 권한 정보
// 기초 정보나 추가적인 권한은 여기에서는 제외
export const menuPermission: {
  [key in keyof typeof MenuNm]: null | Partial<{
    [key in RnTenantPermissionAccess]: IPermissionGenType;
  }>;
} = {
  MenuSales: null,
  MenuSalesModel: null,
  // PAGE - 모델 등록 및 현황
  PageSalesModelCurrent: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    // =============
    // 고객처 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
    // =============
    // 모델 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_MATCH]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_HISTORY]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_SPEC_USE_HISTORY]:
      ALL_PERMISSION,
  },
  PageSalesModelNew: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    // =============
    // 고객처 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
    // =============
    // 모델 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_MATCH]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_HISTORY]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_SPEC_USE_HISTORY]:
      ALL_PERMISSION,
  },
  MenuSalesOrder: null,
  // PAGE - 고객발주
  PageSalesOrderCurrent: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_HISTORY]: ALL_PERMISSION,
    // =============
    // 모델을 그대로 쓰거나 복사해서 쓰기 관련하여 모델 컨트롤러의 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
    // =============
    // 고객처 담당자 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
  },
  PageSalesOrderGrpModel: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_HISTORY]: ALL_PERMISSION,
    // =============
    // 모델을 그대로 쓰거나 복사해서 쓰기 관련하여 모델 컨트롤러의 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
    // =============
    // 고객처 담당자 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
  },
  PageSalesOrderNew: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_HISTORY]: ALL_PERMISSION,
    // =============
    // 모델을 그대로 쓰거나 복사해서 쓰기 관련하여 모델 컨트롤러의 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
    // =============
    // 고객처 담당자 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
  },
  // PAGE - 일별 수주 현황
  PageSalesOrderDay: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_HISTORY]: ALL_PERMISSION,
    // =============
    // 모델을 그대로 쓰거나 복사해서 쓰기 관련하여 모델 컨트롤러의 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
    // =============
    // 고객처 담당자 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
  },
  MenuSalesEstimate: null,
  // PAGE - 견적
  PageSalesEstimateCurrent: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ESTIMATE]: ALL_PERMISSION,
    // =============
    // 모델을 그대로 쓰거나 복사해서 쓰기 관련하여 모델 컨트롤러의 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
  },
  PageSalesEstimateNew: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ESTIMATE]: ALL_PERMISSION,
    // =============
    // 모델을 그대로 쓰거나 복사해서 쓰기 관련하여 모델 컨트롤러의 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
  },
  /**
   * [2025-06-25 최시훈] 매뉴 개편으로 수주 현황 메뉴 삭제
   */
  // MenuSalesStatus: null,
  // // PAGE - 수주현황
  // PageSalesStatus: {
  //   // **********
  //   // 기본 권한 추가
  //   ...menuDefaultPermission,
  //   // **********
  //   [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER]: READ_ONLY,
  // },
  MenuSalesOut: null,
  // PAGE - 출고 대기 현황
  PageSalesOutWait: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_SHIPMENT]: ALL_PERMISSION,
    // =============
    // 고객처 담당자 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
  },
  // PAGE - 출고 확인 대기 현황
  PageSalesOutConfirm: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_SHIPMENT]: ALL_PERMISSION,
    // =============
    // 고객처 담당자 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
  },
  // PAGE - 출고 현황
  PageSalesOutStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_SHIPMENT]: ALL_PERMISSION,
    // =============
    // 고객처 담당자 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
  },
  MenuSalesArray: null,
  // PAGE - 원판 수율 계산
  PageSalesArray: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_BOARD_YIELD_CALC]: ALL_PERMISSION,
  },
  MenuSayang: null,
  MenuSayangModel: null,
  // PAGE - 모델 확정
  PageSayangModelWait: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_MATCH]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_HISTORY]: ALL_PERMISSION,
    // =============
    // 모델 매칭 시 모델 매칭 대기 목록을 출력해야함
    // 모델 매칭 매칭 대기 목록은 발주가 끝나고 출고 완료 후 모델 매칭 대기 목록을 출력해야함
    // 모델 매칭 대기 목록을 출력하기 위해서는 발주 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER]: READ_ONLY,
    // =============
    // 상품 수정은 상태 변경 및 임시 저장을 위해 권한 추가
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT]: {
      read: true,
      // 업데이트는 상태 변경 및 임시 저장을 위해 권한 추가
      update: true,
      delete: false,
      create: false,
    },
    // =============
  },
  // PAGE - 모델 현황
  PageSayangModelStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_MATCH]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_HISTORY]: READ_ONLY,
  },
  MenuSayangSample: null,
  // PAGE - 사양 등록
  PageSayangSampleWait: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_BOARD_ARRAY_CALC]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_MODEL]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_HISTORY]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_PRD_GROUP_PRC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_LAMINATION_SOURCE]:
      ALL_PERMISSION,
    // =============
    // 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_MATCH]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_HISTORY]: READ_ONLY,
  },
  // PAGE - 사양 현황
  PageSayangSampleStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_BOARD_ARRAY_CALC]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_MODEL]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_HISTORY]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_PRD_GROUP_PRC]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_LAMINATION_SOURCE]:
      ALL_PERMISSION,
    // =============
    // 모델 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_MATCH]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D1_MODELS_HISTORY]: READ_ONLY,
  },
  MenuWk: null,
  MenuWkPlan: null,
  // PAGE - 생산 계획
  PageWkPlanWait: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_WAIT_FOR_PRODUCTION_PLAN]:
      ALL_PERMISSION,
    // **********
    // PMS 권한
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE_SCHEDULE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY_QUALITY_CHECK]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY]: ALL_PERMISSION,
    // =============
    // 워크시트를 읽어서 상세 일정을 보기 때문에 워크시트 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_DEFAULT]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_PROCESS_STATUS]:
      READ_ONLY,
    // =============
    // 필요 발주가 있을 수도 있기에 발주 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_REQUEST_MATERIAL]: READ_ONLY,

    // 사양 수정을 위한 권한
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_BOARD_ARRAY_CALC]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_MODEL]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_HISTORY]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_PRD_GROUP_PRC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_LAMINATION_SOURCE]:
      ALL_PERMISSION,
  },
  // PAGE - 생산 계획 투입 현황
  PageWkPlanInputStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_WAIT_FOR_PRODUCTION_PLAN]:
      ALL_PERMISSION,
    // **********
    // PMS 권한
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE_SCHEDULE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY_QUALITY_CHECK]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY]: ALL_PERMISSION,
    // =============
    // 워크시트를 읽어서 상세 일정을 보기 때문에 워크시트 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_DEFAULT]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_PROCESS_STATUS]:
      READ_ONLY,
    // =============
    // 필요 발주가 있을 수도 있기에 발주 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_REQUEST_MATERIAL]: READ_ONLY,

    // 사양 수정을 위한 권한
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_BOARD_ARRAY_CALC]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_MODEL]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_HISTORY]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_PRD_GROUP_PRC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_LAMINATION_SOURCE]:
      ALL_PERMISSION,
  },
  // PAGE - 생산 계획 현황
  PageWkPlanStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_WAIT_FOR_PRODUCTION_PLAN]:
      ALL_PERMISSION,
    // **********
    // PMS 권한
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE_SCHEDULE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY_QUALITY_CHECK]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY]: ALL_PERMISSION,
    // =============
    // 워크시트를 읽어서 상세 일정을 보기 때문에 워크시트 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_DEFAULT]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_PROCESS_STATUS]:
      READ_ONLY,
    // =============
    // 필요 발주가 있을 수도 있기에 발주 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_REQUEST_MATERIAL]: READ_ONLY,

    // 사양 수정을 위한 권한
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_BOARD_ARRAY_CALC]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_MODEL]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_HISTORY]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_PRD_GROUP_PRC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_LAMINATION_SOURCE]:
      ALL_PERMISSION,
  },
  MenuWkStatus: null,
  // PAGE - 공정 현황
  PageWkStatusProc: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_PROCESS_STATUS]:
      ALL_PERMISSION,
    // **********
    // PMS 권한
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE_SCHEDULE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY_QUALITY_CHECK]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY]: ALL_PERMISSION,
    // =============
    // 필요 발주가 있을 수도 있기에 발주 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_REQUEST_MATERIAL]: READ_ONLY,
  },
  // PAGE - 공정 현황
  PageWkStatusWip: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_PROCESS_STATUS]:
      ALL_PERMISSION,
    // **********
    // PMS 권한
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_PROC_EMPLOYEE_SCHEDULE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY_QUALITY_CHECK]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D3_WORKSHEET_PMS_DAILY]: ALL_PERMISSION,
    // =============
    // 필요 발주가 있을 수도 있기에 발주 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D2_REQUEST_MATERIAL]: READ_ONLY,
  },
  // PAGE - 입고 현황
  PageWkStatusInput: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_INPUT_STATUS]:
      ALL_PERMISSION,
  },
  // PAGE - 출고 현황
  PageWkStatusOut: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_SHIPMENT_STATUS]:
      ALL_PERMISSION,
  },
  // PAGE - 중단 현황
  PageWkStatusStop: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_PROCESS_CANCEL]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_PRODUCTION_STATUS_PROCESS_STATUS]:
      ALL_PERMISSION,
  },
  MenuBuy: null,
  MenuBuyOrder: null,
  // PAGE - 구매 단가 등록 및 현황
  PageBuyOrderCurrent: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_PRICE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_HISTORY]:
      ALL_PERMISSION,
  },
  PageBuyOrderNew: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_PRICE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_HISTORY]:
      ALL_PERMISSION,
  },
  MenuBuyCost: null,
  // PAGE - 외주처 단가 등록
  PageBuyCostWait: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_PRICE]:
      ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_HISTORY]:
      ALL_PERMISSION,
  },
  // PAGE - 외주처 단가 현황
  PageBuyCostStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_PRICE]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_CORE_D2_WORKSHEET_VENDER_HISTORY]: READ_ONLY,
  },
  MenuQuality: null,
  MenuQualityRequirements: null,
  // PAGE - 품질요구관리
  PageQualityRequirements: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D3_QUALITY_REQUIREMENTS]:
      ALL_PERMISSION,
  },
  MenuQualityCertification: null,
  // PAGE - 내부인증서
  PageQualityCertification: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D3_QUALITY_CERTIFICATION]:
      ALL_PERMISSION,
  },
  // PAGE - 고객성적서
  PageQualityReports: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D3_QUALITY_REPORTS]: ALL_PERMISSION,
  },
  MenuQualityProcess: null,
  // PAGE - 품질 재투입 요청 공정 현황
  PageQualityProcess: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D3_QUALITY_V2_REPROCESSING]:
      ALL_PERMISSION,
  },
  MenuQualityReports: null,
  MenuQualityInspectionCriteria: null,
  // PAGE - 검사 기준
  PageQualityInspectionCriteria: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D3_QUALITY_V2_INSPECTION_CRITERIA]:
      ALL_PERMISSION,
  },
  MenuQualityClaim: null,
  // PAGE - 클레임 등록
  PageQualityClaim: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
  },
  MenuKpi: null,
  MenuKpiLayer: null,
  PageKpiLayer: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D4_KPI_LAYER_INPUT_QUANTITY_DEFAULT]:
      ALL_PERMISSION,
  },
  MenuKpiPrt: null,
  PageKpiPrt: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D4_KPI_LAYER_CUSTOMER_ORDER_DISTRIBUTION]:
      ALL_PERMISSION,
  },
  MenuSalesTax: null,
  // PAGE - 세금계산서 발행
  PageSalesTaxInvoice: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    // =============
    // 고객처 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT_TAXINV]:
      ALL_PERMISSION,
  },
  // PAGE - 세금계산서 현황
  PageSalesTaxStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    // =============
    // 고객처 관리 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: ALL_PERMISSION,
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_PRODUCT_TAXINV]:
      ALL_PERMISSION,
  },
  MenuSalesCashCollection: null,
  // PAGE - 수금처리
  PageSalesCashCollectionTask: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    // =============
    // 고객처 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: READ_ONLY,
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_COLLECTION_OF_MONEY]:
      ALL_PERMISSION,
  },
  // PAGE - 수금현황
  PageSalesCashCollectionStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    // =============
    // 고객처 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: READ_ONLY,
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_ORDER_COLLECTION_OF_MONEY]:
      ALL_PERMISSION,
  },
  MenuSalesStock: null,
  // PAGE - 재고현황
  PageSalesStockStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    // =============
    // 고객처 읽기 권한이 필요
    // =============
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER]: READ_ONLY,
    [RnTenantPermissionAccess.SERV_BASEINFO_BIZ_PARTNER_MNG]: READ_ONLY,
    // =============
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_INVENTORY]: ALL_PERMISSION,
    [RnTenantPermissionAccess.SERV_CORE_D1_SALES_SHIPMENT]: ALL_PERMISSION,
  },
  MenuSayangApproval: null,
  // @TODO 페이지 개발 완료 후 추가
  // PAGE - 구매승인원
  PageSayangApprovalStatus: null,
  MenuSayangLamination: null,
  // PAGE - 적층구조 현황
  PageSayangLaminationStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_LAMINATION_SOURCE]:
      ALL_PERMISSION,
  },
  MenuSayangArray: null,
  // PAGE - 원판배열 현황
  PageSayangArrayStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D1_SPEC_BOARD_ARRAY_CALC]:
      ALL_PERMISSION,
  },
  MenuQualityBadStatus: null,
  PageQualityBadDailyStatus: {
    // **********
    // 기본 권한 추가
    ...menuDefaultPermission,
    // **********
    [RnTenantPermissionAccess.SERV_CORE_D3_QUALITY_V2_PROCESS_BAD_AGGREGATE]:
      ALL_PERMISSION,
  },
};
