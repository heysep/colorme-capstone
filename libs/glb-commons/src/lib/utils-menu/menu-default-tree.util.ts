import { RnTenantCbizMenuEntity } from '../core-typeorm/entity/tenant/core-biz-entity/entity/rn-tenant-cbiz-menu.tenant-mysql-entity';
import {
  RnTenantCbizMenuClassifyType,
  RnTenantCbizMenuType,
} from '../core-typeorm/entity/tenant/core-biz-entity/enum/rn-tenant-cbiz-menu.enum';

type MenuItem = {
  url: string | null;
  title: string;
};

type MenuAPI<T extends Record<string, MenuItem>> = T;

function createMenu<T extends Record<string, MenuItem>>(obj: T): MenuAPI<T> {
  return obj as MenuAPI<T>;
}

export function getOnlyMenuName(input: string): string {
  // Remove the first word (everything before the first space)
  const firstSpaceIndex = input.indexOf(' ');
  return firstSpaceIndex === -1 ? input : input.substring(firstSpaceIndex + 1);
}

/**
 * 메뉴 이름
 */
export const MenuNm = createMenu({
  MenuSales: {
    title: '[메뉴-1] 영업',
    url: 'sales',
  },
  MenuSalesModel: {
    title: '[메뉴-2] 모델 등록',
    url: 'd2_sales/model',
  },
  PageSalesModelNew: {
    title: '[페이지] 모델 등록',
    url: 'sales/model/new',
  },
  PageSalesModelCurrent: {
    title: '[페이지] 모델 현황',
    url: 'sales/model/status',
  },
  // ----
  MenuSalesEstimate: {
    title: '[메뉴-2] 견적',
    url: 'd2_sales/estimate',
  },
  PageSalesEstimateNew: {
    title: '[페이지] 견적등록',
    url: 'sales/estimate/new',
  },
  PageSalesEstimateCurrent: {
    title: '[페이지] 견적현황',
    url: 'sales/estimate/status',
  },
  // ----
  MenuSalesOrder: {
    title: '[메뉴-2] 수주',
    url: 'd2_sales/order',
  },
  PageSalesOrderNew: {
    title: '[페이지] 수주등록',
    url: 'sales/order/new',
  },
  PageSalesOrderCurrent: {
    title: '[페이지] 수주별 수주 현황',
    url: 'sales/order/status',
  },
  PageSalesOrderGrpModel: {
    title: '[페이지] 모델별 수주 현황',
    url: 'sales/order/model',
  },
  // ----
  MenuSalesOut: {
    title: '[메뉴-2] 출고',
    url: 'd2_sales/out',
  },
  PageSalesOutWait: {
    title: '[페이지] 출고 처리',
    url: 'sales/out/wait',
  },
  PageSalesOutConfirm: {
    title: '[페이지] 출고 확인 처리',
    url: 'sales/out/confirm',
  },
  PageSalesOutStatus: {
    title: '[페이지] 출고 현황',
    url: 'sales/out/status',
  },
  // ----
  MenuSalesTax: { title: '[메뉴-2] 세금계산서', url: 'd2_sales/tax' },
  PageSalesTaxInvoice: {
    title: '[페이지] 계산서 발행',
    url: 'sales/tax/invoice',
  },
  PageSalesTaxStatus: {
    title: '[페이지] 계산서 발행 현황',
    url: 'sales/tax/status',
  },
  // 영업 - 수금
  MenuSalesCashCollection: {
    title: '[메뉴-2] 수금',
    url: 'd2_sales/cash-collection',
  },
  PageSalesCashCollectionTask: {
    title: '[페이지] 수금처리',
    url: 'sales/cash-collection/task',
  },
  PageSalesCashCollectionStatus: {
    title: '[페이지] 수금현황',
    url: 'sales/cash-collection/status',
  },
  // 영업 - 재고
  MenuSalesStock: { title: '[메뉴-2] 재고', url: 'd2_sales/stock' },
  PageSalesStockStatus: {
    title: '[페이지] 재고현황',
    url: 'sales/stock/status',
  },
  // ----
  /**
   * [2025-06-25 최시훈] 매뉴 개편으로 수주 현황 메뉴 삭제
   */
  // MenuSalesStatus: {
  //   title: '[메뉴-2] 수주현황',
  //   url: 'd2_sales/status',
  // },
  // PageSalesStatus: {
  //   title: '[페이지] 수주현황',
  //   url: 'sales/status',
  // },
  // ----
  MenuSalesArray: {
    title: '[메뉴-2] 원판 수율 계산',
    url: 'd2_sales/array',
  },
  PageSalesArray: {
    title: '[페이지] 원판 수율 계산',
    url: 'sales/array',
  },
  // ===============
  MenuSayang: {
    title: '[메뉴-1] 사양',
    url: 'sayang',
  },
  MenuSayangModel: {
    title: '[메뉴-2] 모델 확정',
    url: 'd2_sayang/model',
  },
  PageSayangModelWait: {
    title: '[페이지] 모델 확정',
    url: 'sayang/model/confirm',
  },
  PageSayangModelStatus: {
    title: '[페이지] 모델 확정 현황',
    url: 'sayang/model/status',
  },
  // ----
  MenuSayangSample: {
    title: '[메뉴-2] 사양 등록',
    url: 'd2_sayang/sample',
  },
  PageSayangSampleWait: {
    title: '[페이지] 사양 등록',
    url: 'sayang/sample/regist',
  },
  PageSayangSampleStatus: {
    title: '[페이지] 사양 현황',
    url: 'sayang/sample/status',
  },
  // 사양 - 구매승인원
  MenuSayangApproval: {
    title: '[메뉴-2] 구매승인원',
    url: 'd2_sayang/approval',
  },
  PageSayangApprovalStatus: {
    title: '[페이지] 구매승인원',
    url: 'sayang/approval/status',
  },
  // 사양 - 적층구조
  MenuSayangLamination: {
    title: '[메뉴-2] 적층구조',
    url: 'd2_sayang/lamination',
  },
  PageSayangLaminationStatus: {
    title: '[페이지] 적층구조',
    url: 'sayang/lamination/status',
  },
  // 사양 - 원판배열
  MenuSayangArray: { title: '[메뉴-2] 원판배열', url: 'd2_sayang/array' },
  PageSayangArrayStatus: {
    title: '[페이지] 원판배열',
    url: 'sayang/array/status',
  },
  // 사양 - 수주등록 > 일별 수주 현황
  PageSalesOrderDay: {
    title: '[페이지] 일별 수주 현황',
    url: 'sales/order/day',
  },
  /**
   * [2025-07-24 최시훈] 생산의 생산계획대기 메뉴를 사양의 작업지시 메뉴로 변경
   */
  MenuWkPlan: {
    title: '[메뉴-2] 작업지시서',
    url: 'd2_sayang/wk',
  },
  PageWkPlanWait: {
    title: '[페이지] 작업지시서',
    url: 'sayang/wk/order',
  },
  PageWkPlanInputStatus: {
    title: '[페이지] 작업지시서 투입 현황',
    url: 'sayang/wk/input',
  },
  PageWkPlanStatus: {
    title: '[페이지] 작업지시서 현황',
    url: 'sayang/wk/status',
  },
  // ===============
  MenuWk: {
    title: '[메뉴-1] 생산',
    url: 'wk',
  },
  // ----
  MenuWkStatus: {
    title: '[메뉴-2] 생산 관리 현황',
    url: 'd2_wk/status',
  },
  PageWkStatusProc: {
    title: '[페이지] 공정 현황',
    url: 'wk/status/proc',
  },
  PageWkStatusInput: {
    title: '[페이지] 투입 현황',
    url: 'wk/status/input',
  },
  PageWkStatusWip: {
    title: '[페이지] WIP',
    url: 'wk/status/wip',
  },
  PageWkStatusOut: {
    title: '[페이지] 생산 완료 현황',
    url: 'wk/status/completed',
  },
  PageWkStatusStop: {
    title: '[페이지] 생산 중단 현황',
    url: 'wk/status/stop',
  },
  // ===============
  MenuBuy: {
    title: '[메뉴-1] 구매/발주',
    url: 'buy',
  },
  MenuBuyOrder: {
    title: '[메뉴-2] 자재 발주',
    url: 'd2_buy/order',
  },
  PageBuyOrderNew: {
    title: '[페이지] 자재 발주 등록',
    url: 'buy/order/new',
  },
  PageBuyOrderCurrent: {
    title: '[페이지] 자재 발주 현황',
    url: 'buy/order/status',
  },
  // ----
  MenuBuyCost: {
    title: '[메뉴-2] 외주 발주',
    url: 'd2_buy/cost',
  },
  PageBuyCostWait: {
    title: '[페이지] 외주 발주 등록',
    url: 'buy/cost/wait',
  },
  PageBuyCostStatus: {
    title: '[페이지] 외주 발주 현황',
    url: 'buy/cost/status',
  },
  // ===============
  MenuQuality: {
    title: '[메뉴-1] 품질',
    url: 'quality',
  },
  MenuQualityRequirements: {
    title: '[메뉴-2] 고객요구사항',
    url: 'd2_quality/requirement',
  },
  PageQualityRequirements: {
    title: '[페이지] 품질요구관리',
    url: 'quality/requirement',
  },
  // ----
  MenuQualityCertification: {
    title: '[메뉴-2] 인증서',
    url: 'd2_quality/certification',
  },
  PageQualityCertification: {
    title: '[페이지] 내부인증서',
    url: 'quality/certification',
  },
  // ----
  MenuQualityReports: {
    title: '[메뉴-2] 신뢰성성적서',
    url: 'd2_quality/reports',
  },
  PageQualityReports: {
    title: '[페이지] 고객성적서',
    url: 'quality/reports',
  },
  // ----
  MenuQualityProcess: {
    title: '[메뉴-2] 재투입 요청',
    url: 'd2_quality/process',
  },
  PageQualityProcess: {
    title: '[페이지] 재투입 요청 현황',
    url: 'quality/process',
  },
  // ----
  MenuQualityInspectionCriteria: {
    title: '[메뉴-2] 고객 검사 기준서',
    url: 'd2_quality/inspection',
  },
  PageQualityInspectionCriteria: {
    title: '[페이지] 고객 검사 기준서',
    url: 'quality/inspection',
  },
  // ----
  MenuQualityClaim: {
    title: '[메뉴-2] 클레임 등록',
    url: 'd2_quality/claim',
  },
  PageQualityClaim: {
    title: '[페이지] 클레임 등록',
    url: 'quality/claim',
  },
  // ----
  MenuQualityBadStatus: {
    title: '[메뉴-2] 불량 현황',
    url: 'd2_quality/bad-status',
  },
  PageQualityBadDailyStatus: {
    title: '[페이지] 일별 불량 현황',
    url: 'quality/bad-status/daily',
  },
  // ===============
  MenuKpi: {
    title: '[메뉴-1] KPI',
    url: 'kpi',
  },
  MenuKpiLayer: {
    title: '[메뉴-2] 층별 매수 현황',
    url: 'd2_kpi/layer',
  },
  PageKpiLayer: {
    title: '[페이지] 층별 매수 현황',
    url: 'kpi/layer',
  },
  // ----
  MenuKpiPrt: {
    title: '[메뉴-2] TOP 거래처',
    url: 'd2_kpi/prt',
  },
  PageKpiPrt: {
    title: '[페이지] TOP 거래처',
    url: 'kpi/prt',
  },
  // ---
});

/**
 * [2025-06-25 최시훈] 통합 검색 기능 제거
 */
// function getJsxcrudSearchJSON(fields: string[]): string {
//   return JSON.stringify({
//     $or: [
//       ...fields.map((field) => {
//         // 만약 field가 '.'을 2개 이상 포함하고 있으면
//         if (field.includes('.') && field.split('.').length >= 3) {
//           // 예시 prtInfo.prt.prtNm
//           // 예시 prtInfo.prt.prtRegCd
//           // ==>  prtInfoPrtOrigin.prtNm
//           // ==>  prtInfoPrtOrigin.prtRegCd
//           // 로 변환해서 처리해야 한다.
//           const parts = field.split('.');
//           const columnName = parts.pop(); // 마지막 부분은 컬럼 이름
//           const transformedPath =
//             parts
//               .map((part, index) => {
//                 // 첫번째 부분은 그대로 반환
//                 if (index === 0) {
//                   return part;
//                 }

//                 // 첫 글자를 대문자로 변환
//                 return part.charAt(0).toUpperCase() + part.slice(1);
//               })
//               .join('') + 'Origin';

//           return {
//             [`${transformedPath}.${columnName}`]: {
//               $startsL: '##REPLACE_TEXT##',
//             },
//           };
//         }

//         return {
//           [field]: { $startsL: '##REPLACE_TEXT##' },
//         };
//       }),
//     ],
//   });
// }

/**
 * 메뉴 이름
 * 공통 메모에서 어떤게 릴레이션이 걸릴지
 * 조회할때 뭐가 필요한지
 * 공통 메모 루트 엔티티 이름
 */
const menuTree: Omit<
  RnTenantCbizMenuEntity & { parentMenuRefName: string | null },
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'parent' | 'children'
>[] = [
  {
    // ----------------------------
    parentMenuRefName: null,
    menuName: getOnlyMenuName(MenuNm.MenuSales.title),
    menuNameOrigin: MenuNm.MenuSales.title,
    menuRefName: MenuNm.MenuSales.url,
    menuUrl: MenuNm.MenuSales.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 1,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSales.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSalesEstimate.title),
    menuNameOrigin: MenuNm.MenuSalesEstimate.title,
    menuRefName: MenuNm.MenuSalesEstimate.url,
    menuUrl: MenuNm.MenuSalesEstimate.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesEstimate.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesEstimateNew.title),
    menuNameOrigin: MenuNm.PageSalesEstimateNew.title,
    menuRefName: MenuNm.PageSalesEstimateNew.url,
    menuUrl: MenuNm.PageSalesEstimateNew.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesEstimate.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesEstimateCurrent.title),
    menuNameOrigin: MenuNm.PageSalesEstimateCurrent.title,
    menuRefName: MenuNm.PageSalesEstimateCurrent.url,
    menuUrl: MenuNm.PageSalesEstimateCurrent.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSales.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSalesOut.title),
    menuNameOrigin: MenuNm.MenuSalesOut.title,
    menuRefName: MenuNm.MenuSalesOut.url,
    menuUrl: MenuNm.MenuSalesOut.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesOut.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesOutWait.title),
    menuNameOrigin: MenuNm.PageSalesOutWait.title,
    menuRefName: MenuNm.PageSalesOutWait.url,
    menuUrl: MenuNm.PageSalesOutWait.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesOut.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesOutConfirm.title),
    menuNameOrigin: MenuNm.PageSalesOutConfirm.title,
    menuRefName: MenuNm.PageSalesOutConfirm.url,
    menuUrl: MenuNm.PageSalesOutConfirm.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesOut.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesOutStatus.title),
    menuNameOrigin: MenuNm.PageSalesOutStatus.title,
    menuRefName: MenuNm.PageSalesOutStatus.url,
    menuUrl: MenuNm.PageSalesOutStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSales.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSalesTax.title),
    menuNameOrigin: MenuNm.MenuSalesTax.title,
    menuRefName: MenuNm.MenuSalesTax.url,
    menuUrl: MenuNm.MenuSalesTax.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesTax.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesTaxInvoice.title),
    menuNameOrigin: MenuNm.PageSalesTaxInvoice.title,
    menuRefName: MenuNm.PageSalesTaxInvoice.url,
    menuUrl: MenuNm.PageSalesTaxInvoice.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesTax.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesTaxStatus.title),
    menuNameOrigin: MenuNm.PageSalesTaxStatus.title,
    menuRefName: MenuNm.PageSalesTaxStatus.url,
    menuUrl: MenuNm.PageSalesTaxStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSales.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSalesCashCollection.title),
    menuNameOrigin: MenuNm.MenuSalesCashCollection.title,
    menuRefName: MenuNm.MenuSalesCashCollection.url,
    menuUrl: MenuNm.MenuSalesCashCollection.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesCashCollection.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesCashCollectionTask.title),
    menuNameOrigin: MenuNm.PageSalesCashCollectionTask.title,
    menuRefName: MenuNm.PageSalesCashCollectionTask.url,
    menuUrl: MenuNm.PageSalesCashCollectionTask.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesCashCollection.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesCashCollectionStatus.title),
    menuNameOrigin: MenuNm.PageSalesCashCollectionStatus.title,
    menuRefName: MenuNm.PageSalesCashCollectionStatus.url,
    menuUrl: MenuNm.PageSalesCashCollectionStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSales.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSalesStock.title),
    menuNameOrigin: MenuNm.MenuSalesStock.title,
    menuRefName: MenuNm.MenuSalesStock.url,
    menuUrl: MenuNm.MenuSalesStock.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesStock.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesStockStatus.title),
    menuNameOrigin: MenuNm.PageSalesStockStatus.title,
    menuRefName: MenuNm.PageSalesStockStatus.url,
    menuUrl: MenuNm.PageSalesStockStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  /**
   * [2025-06-25 최시훈] 매뉴 개편으로 수주 현황 메뉴 삭제
   */
  // {
  //   // ----------------------------
  //   parentMenuRefName: MenuNm.MenuSales.url,
  //   // -----------
  //   menuName: getOnlyMenuName(MenuNm.MenuSalesStatus.title),
  //   menuNameOrigin: MenuNm.MenuSalesStatus.title,
  //   menuRefName: MenuNm.MenuSalesStatus.url,
  //   menuUrl: MenuNm.MenuSalesStatus.url,
  //   // ----------------------------
  //   useYn: true,
  //   ordNo: -1,
  //   menuTypeEm: RnTenantCbizMenuType.MENU,
  //   menuClassifyEm: RnTenantCbizMenuClassify.NORMAL,
  //   menuActAdd: false,
  //   menuActUp: false,
  //   menuActDel: false,
  //   menuActApp: false,
  //   menuActList: false,
  //   menuDepth: 2,
  //   menuActOther: '{}',
  //   menuSearchJsxcrud: null,
  // },
  // {
  //   // ----------------------------
  //   parentMenuRefName: MenuNm.MenuSalesStatus.url,
  //   // -----------
  //   menuName: getOnlyMenuName(MenuNm.PageSalesStatus.title),
  //   menuNameOrigin: MenuNm.PageSalesStatus.title,
  //   menuRefName: MenuNm.PageSalesStatus.url,
  //   menuUrl: MenuNm.PageSalesStatus.url,
  //   // ----------------------------
  //   useYn: true,
  //   ordNo: -1,
  //   menuTypeEm: RnTenantCbizMenuType.PAGE,
  //   menuClassifyEm: RnTenantCbizMenuClassify.NORMAL,
  //   menuActAdd: false,
  //   menuActUp: false,
  //   menuActDel: false,
  //   menuActApp: false,
  //   menuActList: false,
  //   menuDepth: 3,
  //   menuActOther: '{}',
  //   menuSearchJsxcrud: getJsxcrudSearchJSON(['orderTit']),
  // },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSales.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSalesArray.title),
    menuNameOrigin: MenuNm.MenuSalesArray.title,
    menuRefName: MenuNm.MenuSalesArray.url,
    menuUrl: MenuNm.MenuSalesArray.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesArray.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesArray.title),
    menuNameOrigin: MenuNm.PageSalesArray.title,
    menuRefName: MenuNm.PageSalesArray.url,
    menuUrl: MenuNm.PageSalesArray.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: null,
    menuName: getOnlyMenuName(MenuNm.MenuSayang.title),
    menuNameOrigin: MenuNm.MenuSayang.title,
    menuRefName: MenuNm.MenuSayang.url,
    menuUrl: MenuNm.MenuSayang.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 1,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    menuName: getOnlyMenuName(MenuNm.MenuSalesModel.title),
    menuNameOrigin: MenuNm.MenuSalesModel.title,
    menuRefName: MenuNm.MenuSalesModel.url,
    menuUrl: MenuNm.MenuSalesModel.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesModel.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesModelNew.title),
    menuNameOrigin: MenuNm.PageSalesModelNew.title,
    menuRefName: MenuNm.PageSalesModelNew.url,
    menuUrl: MenuNm.PageSalesModelNew.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesModel.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesModelCurrent.title),
    menuNameOrigin: MenuNm.PageSalesModelCurrent.title,
    menuRefName: MenuNm.PageSalesModelCurrent.url,
    menuUrl: MenuNm.PageSalesModelCurrent.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSalesOrder.title),
    menuNameOrigin: MenuNm.MenuSalesOrder.title,
    menuRefName: MenuNm.MenuSalesOrder.url,
    menuUrl: MenuNm.MenuSalesOrder.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  // {
  //   // ----------------------------
  //   parentMenuRefName: MenuNm.MenuSalesOrder.url,
  //   // -----------
  //   menuName: getOnlyMenuName(MenuNm.PageSalesOrderNew.title),
  //   menuNameOrigin: MenuNm.PageSalesOrderNew.title,
  //   menuRefName: MenuNm.PageSalesOrderNew.url,
  //   menuUrl: MenuNm.PageSalesOrderNew.url,
  //   // ----------------------------
  //   useYn: true,
  //   ordNo: -1,
  //   menuTypeEm: RnTenantCbizMenuType.PAGE,
  //   menuClassifyEm: RnTenantCbizMenuClassify.NORMAL,
  //   menuActAdd: false,
  //   menuActUp: false,
  //   menuActDel: false,
  //   menuActApp: false,
  //   menuActList: false,
  //   menuDepth: 3,
  //   menuActOther: '{}',
  //   menuSearchJsxcrud: null,
  // },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesOrder.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesOrderDay.title),
    menuNameOrigin: MenuNm.PageSalesOrderDay.title,
    menuRefName: MenuNm.PageSalesOrderDay.url,
    menuUrl: MenuNm.PageSalesOrderDay.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesOrder.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesOrderCurrent.title),
    menuNameOrigin: MenuNm.PageSalesOrderCurrent.title,
    menuRefName: MenuNm.PageSalesOrderCurrent.url,
    menuUrl: MenuNm.PageSalesOrderCurrent.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSalesOrder.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSalesOrderGrpModel.title),
    menuNameOrigin: MenuNm.PageSalesOrderGrpModel.title,
    menuRefName: MenuNm.PageSalesOrderGrpModel.url,
    menuUrl: MenuNm.PageSalesOrderGrpModel.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    menuName: getOnlyMenuName(MenuNm.MenuSayangModel.title),
    menuNameOrigin: MenuNm.MenuSayangModel.title,
    menuRefName: MenuNm.MenuSayangModel.url,
    menuUrl: MenuNm.MenuSayangModel.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayangModel.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSayangModelWait.title),
    menuNameOrigin: MenuNm.PageSayangModelWait.title,
    menuRefName: MenuNm.PageSayangModelWait.url,
    menuUrl: MenuNm.PageSayangModelWait.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayangModel.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSayangModelStatus.title),
    menuNameOrigin: MenuNm.PageSayangModelStatus.title,
    menuRefName: MenuNm.PageSayangModelStatus.url,
    menuUrl: MenuNm.PageSayangModelStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuSayangSample.title),
    menuNameOrigin: MenuNm.MenuSayangSample.title,
    menuRefName: MenuNm.MenuSayangSample.url,
    menuUrl: MenuNm.MenuSayangSample.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayangSample.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSayangSampleWait.title),
    menuNameOrigin: MenuNm.PageSayangSampleWait.title,
    menuRefName: MenuNm.PageSayangSampleWait.url,
    menuUrl: MenuNm.PageSayangSampleWait.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: true,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayangSample.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSayangSampleStatus.title),
    menuNameOrigin: MenuNm.PageSayangSampleStatus.title,
    menuRefName: MenuNm.PageSayangSampleStatus.url,
    menuUrl: MenuNm.PageSayangSampleStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: true,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  /**
   * [2025-07-24 최시훈] 생산의 생산계획대기 메뉴를 사양의 작업지시 메뉴로 변경
   */
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    menuName: getOnlyMenuName(MenuNm.MenuWkPlan.title),
    menuNameOrigin: MenuNm.MenuWkPlan.title,
    menuRefName: MenuNm.MenuWkPlan.url,
    menuUrl: MenuNm.MenuWkPlan.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuWkPlan.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageWkPlanWait.title),
    menuNameOrigin: MenuNm.PageWkPlanWait.title,
    menuRefName: MenuNm.PageWkPlanWait.url,
    menuUrl: MenuNm.PageWkPlanWait.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    menuName: getOnlyMenuName(MenuNm.MenuSayangApproval.title),
    menuNameOrigin: MenuNm.MenuSayangApproval.title,
    menuRefName: MenuNm.MenuSayangApproval.url,
    menuUrl: MenuNm.MenuSayangApproval.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayangApproval.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSayangApprovalStatus.title),
    menuNameOrigin: MenuNm.PageSayangApprovalStatus.title,
    menuRefName: MenuNm.PageSayangApprovalStatus.url,
    menuUrl: MenuNm.PageSayangApprovalStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    menuName: getOnlyMenuName(MenuNm.MenuSayangLamination.title),
    menuNameOrigin: MenuNm.MenuSayangLamination.title,
    menuRefName: MenuNm.MenuSayangLamination.url,
    menuUrl: MenuNm.MenuSayangLamination.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayangLamination.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSayangLaminationStatus.title),
    menuNameOrigin: MenuNm.PageSayangLaminationStatus.title,
    menuRefName: MenuNm.PageSayangLaminationStatus.url,
    menuUrl: MenuNm.PageSayangLaminationStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayang.url,
    menuName: getOnlyMenuName(MenuNm.MenuSayangArray.title),
    menuNameOrigin: MenuNm.MenuSayangArray.title,
    menuRefName: MenuNm.MenuSayangArray.url,
    menuUrl: MenuNm.MenuSayangArray.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuSayangArray.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageSayangArrayStatus.title),
    menuNameOrigin: MenuNm.PageSayangArrayStatus.title,
    menuRefName: MenuNm.PageSayangArrayStatus.url,
    menuUrl: MenuNm.PageSayangArrayStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: null,
    menuName: getOnlyMenuName(MenuNm.MenuWk.title),
    menuNameOrigin: MenuNm.MenuWk.title,
    menuRefName: MenuNm.MenuWk.url,
    menuUrl: MenuNm.MenuWk.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 1,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuWk.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuWkStatus.title),
    menuNameOrigin: MenuNm.MenuWkStatus.title,
    menuRefName: MenuNm.MenuWkStatus.url,
    menuUrl: MenuNm.MenuWkStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuWkStatus.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageWkStatusProc.title),
    menuNameOrigin: MenuNm.PageWkStatusProc.title,
    menuRefName: MenuNm.PageWkStatusProc.url,
    menuUrl: MenuNm.PageWkStatusProc.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuWkStatus.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageWkStatusWip.title),
    menuNameOrigin: MenuNm.PageWkStatusWip.title,
    menuRefName: MenuNm.PageWkStatusWip.url,
    menuUrl: MenuNm.PageWkStatusWip.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuWkStatus.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageWkStatusInput.title),
    menuNameOrigin: MenuNm.PageWkStatusInput.title,
    menuRefName: MenuNm.PageWkStatusInput.url,
    menuUrl: MenuNm.PageWkStatusInput.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuWkStatus.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageWkStatusOut.title),
    menuNameOrigin: MenuNm.PageWkStatusOut.title,
    menuRefName: MenuNm.PageWkStatusOut.url,
    menuUrl: MenuNm.PageWkStatusOut.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuWkStatus.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageWkStatusStop.title),
    menuNameOrigin: MenuNm.PageWkStatusStop.title,
    menuRefName: MenuNm.PageWkStatusStop.url,
    menuUrl: MenuNm.PageWkStatusStop.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: null,
    menuName: getOnlyMenuName(MenuNm.MenuBuy.title),
    menuNameOrigin: MenuNm.MenuBuy.title,
    menuRefName: MenuNm.MenuBuy.url,
    menuUrl: MenuNm.MenuBuy.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 1,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuBuy.url,
    menuName: getOnlyMenuName(MenuNm.MenuBuyOrder.title),
    menuNameOrigin: MenuNm.MenuBuyOrder.title,
    menuRefName: MenuNm.MenuBuyOrder.url,
    menuUrl: MenuNm.MenuBuyOrder.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuBuyOrder.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageBuyOrderNew.title),
    menuNameOrigin: MenuNm.PageBuyOrderNew.title,
    menuRefName: MenuNm.PageBuyOrderNew.url,
    menuUrl: MenuNm.PageBuyOrderNew.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuBuyOrder.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageBuyOrderCurrent.title),
    menuNameOrigin: MenuNm.PageBuyOrderCurrent.title,
    menuRefName: MenuNm.PageBuyOrderCurrent.url,
    menuUrl: MenuNm.PageBuyOrderCurrent.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuBuy.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuBuyCost.title),
    menuNameOrigin: MenuNm.MenuBuyCost.title,
    menuRefName: MenuNm.MenuBuyCost.url,
    menuUrl: MenuNm.MenuBuyCost.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuBuyCost.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageBuyCostStatus.title),
    menuNameOrigin: MenuNm.PageBuyCostStatus.title,
    menuRefName: MenuNm.PageBuyCostStatus.url,
    menuUrl: MenuNm.PageBuyCostStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuBuyCost.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageBuyCostWait.title),
    menuNameOrigin: MenuNm.PageBuyCostWait.title,
    menuRefName: MenuNm.PageBuyCostWait.url,
    menuUrl: MenuNm.PageBuyCostWait.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: null,
    menuName: getOnlyMenuName(MenuNm.MenuQuality.title),
    menuNameOrigin: MenuNm.MenuQuality.title,
    menuRefName: MenuNm.MenuQuality.url,
    menuUrl: MenuNm.MenuQuality.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 1,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQuality.url,
    menuName: getOnlyMenuName(MenuNm.MenuQualityRequirements.title),
    menuNameOrigin: MenuNm.MenuQualityRequirements.title,
    menuRefName: MenuNm.MenuQualityRequirements.url,
    menuUrl: MenuNm.MenuQualityRequirements.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQualityRequirements.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageQualityRequirements.title),
    menuNameOrigin: MenuNm.PageQualityRequirements.title,
    menuRefName: MenuNm.PageQualityRequirements.url,
    menuUrl: MenuNm.PageQualityRequirements.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQuality.url,
    menuName: getOnlyMenuName(MenuNm.MenuQualityCertification.title),
    menuNameOrigin: MenuNm.MenuQualityCertification.title,
    menuRefName: MenuNm.MenuQualityCertification.url,
    menuUrl: MenuNm.MenuQualityCertification.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQualityCertification.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageQualityCertification.title),
    menuNameOrigin: MenuNm.PageQualityCertification.title,
    menuRefName: MenuNm.PageQualityCertification.url,
    menuUrl: MenuNm.PageQualityCertification.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQuality.url,
    menuName: getOnlyMenuName(MenuNm.MenuQualityReports.title),
    menuNameOrigin: MenuNm.MenuQualityReports.title,
    menuRefName: MenuNm.MenuQualityReports.url,
    menuUrl: MenuNm.MenuQualityReports.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQualityReports.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageQualityReports.title),
    menuNameOrigin: MenuNm.PageQualityReports.title,
    menuRefName: MenuNm.PageQualityReports.url,
    menuUrl: MenuNm.PageQualityReports.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQuality.url,
    menuName: getOnlyMenuName(MenuNm.MenuQualityProcess.title),
    menuNameOrigin: MenuNm.MenuQualityProcess.title,
    menuRefName: MenuNm.MenuQualityProcess.url,
    menuUrl: MenuNm.MenuQualityProcess.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQualityProcess.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageQualityProcess.title),
    menuNameOrigin: MenuNm.PageQualityProcess.title,
    menuRefName: MenuNm.PageQualityProcess.url,
    menuUrl: MenuNm.PageQualityProcess.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQuality.url,
    menuName: getOnlyMenuName(MenuNm.MenuQualityInspectionCriteria.title),
    menuNameOrigin: MenuNm.MenuQualityInspectionCriteria.title,
    menuRefName: MenuNm.MenuQualityInspectionCriteria.url,
    menuUrl: MenuNm.MenuQualityInspectionCriteria.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQualityInspectionCriteria.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageQualityInspectionCriteria.title),
    menuNameOrigin: MenuNm.PageQualityInspectionCriteria.title,
    menuRefName: MenuNm.PageQualityInspectionCriteria.url,
    menuUrl: MenuNm.PageQualityInspectionCriteria.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQuality.url,
    menuName: getOnlyMenuName(MenuNm.MenuQualityClaim.title),
    menuNameOrigin: MenuNm.MenuQualityClaim.title,
    menuRefName: MenuNm.MenuQualityClaim.url,
    menuUrl: MenuNm.MenuQualityClaim.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQualityClaim.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageQualityClaim.title),
    menuNameOrigin: MenuNm.PageQualityClaim.title,
    menuRefName: MenuNm.PageQualityClaim.url,
    menuUrl: MenuNm.PageQualityClaim.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQuality.url,
    menuName: getOnlyMenuName(MenuNm.MenuQualityBadStatus.title),
    menuNameOrigin: MenuNm.MenuQualityBadStatus.title,
    menuRefName: MenuNm.MenuQualityBadStatus.url,
    menuUrl: MenuNm.MenuQualityBadStatus.url,
    // -----------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuQualityBadStatus.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageQualityBadDailyStatus.title),
    menuNameOrigin: MenuNm.PageQualityBadDailyStatus.title,
    menuRefName: MenuNm.PageQualityBadDailyStatus.url,
    menuUrl: MenuNm.PageQualityBadDailyStatus.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: null,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuKpi.title),
    menuNameOrigin: MenuNm.MenuKpi.title,
    menuRefName: MenuNm.MenuKpi.url,
    menuUrl: MenuNm.MenuKpi.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 1,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuKpi.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuKpiLayer.title),
    menuNameOrigin: MenuNm.MenuKpiLayer.title,
    menuRefName: MenuNm.MenuKpiLayer.url,
    menuUrl: MenuNm.MenuKpiLayer.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuKpiLayer.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageKpiLayer.title),
    menuNameOrigin: MenuNm.PageKpiLayer.title,
    menuRefName: MenuNm.PageKpiLayer.url,
    menuUrl: MenuNm.PageKpiLayer.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuKpi.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.MenuKpiPrt.title),
    menuNameOrigin: MenuNm.MenuKpiPrt.title,
    menuRefName: MenuNm.MenuKpiPrt.url,
    menuUrl: MenuNm.MenuKpiPrt.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.MENU,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 2,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
  {
    // ----------------------------
    parentMenuRefName: MenuNm.MenuKpiPrt.url,
    // -----------
    menuName: getOnlyMenuName(MenuNm.PageKpiPrt.title),
    menuNameOrigin: MenuNm.PageKpiPrt.title,
    menuRefName: MenuNm.PageKpiPrt.url,
    menuUrl: MenuNm.PageKpiPrt.url,
    // ----------------------------
    useYn: true,
    ordNo: -1,
    menuTypeEm: RnTenantCbizMenuType.PAGE,
    menuClassifyEm: RnTenantCbizMenuClassifyType.NORMAL,
    menuActAdd: false,
    menuActUp: false,
    menuActDel: false,
    menuActApp: false,
    menuActList: false,
    menuDepth: 3,
    menuActOther: '{}',
    menuSearchJsxcrud: null,
  },
].map((menu, index) => ({
  ...menu,
  ordNo: index + 1,
}));

/**
 * 메뉴 트리 반환
 *
 * @param type pcb | pms 타입
 * @returns 메뉴 트리
 */
export type MenuTreeoptionsType = 'pcb' | 'pms';
export const getMenuTree = (): Omit<
  RnTenantCbizMenuEntity & { parentMenuRefName: string | null },
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'parent' | 'children'
>[] => {
  return [...menuTree];
};
