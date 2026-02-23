/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RnTenantPermissionAccess } from '../../../core-acl/decorator/permission.decorator';
import { RnTenantPermissionEntity } from '../../entity/tenant/rn-tenant-permission.tenant-mysql-entity';

import { getMenuTree } from '../../../utils-menu/menu-default-tree.util';
import { RnTenantCbizConfigEntity } from '../../entity/tenant/core-biz-entity/entity/rn-tenant-cbiz-config.tenant-mysql-entity';
import { RnTenantCbizMenuEntity } from '../../entity/tenant/core-biz-entity/entity/rn-tenant-cbiz-menu.tenant-mysql-entity';
import { RnTenantCbizConfigKeyType } from '../../entity/tenant/core-biz-entity/enum/rn-tenant-cbiz-config.enum';
import { TENANT_CONNECTION_TEST_TENANT_CODE } from '../../utils/typeorm.utils';

/**
 * 테넌트 비니지스 로직 관련 초기화 작업
 *
 * @param datasoure 데이터소스
 */
export async function initTenantBizTask(datasoure: DataSource) {
  const logger = new Logger(initTenantBizTask.name);

  // 만약 이름이 TENANT_CONNECTION_TEST_TENANT_CODE 이라면 초기화 하지 않습니다.
  if (datasoure.options.database === TENANT_CONNECTION_TEST_TENANT_CODE) {
    return;
  }

  try {
    // --------------------------------
    // 매 작업 시작 전 초기 작업
    // --------------------------------

    // 이미 초기화가 1번 이상 되었는지 확인
    const config = await datasoure
      .getRepository(RnTenantCbizConfigEntity)
      .findOne({
        where: {
          key: RnTenantCbizConfigKeyType.Init,
        },
      });
    // 이미 초기화가 1번 이상 되었으면 종료
    if (config) {
      return;
    }

    // - 초기화 키 저장
    await datasoure.getRepository(RnTenantCbizConfigEntity).save({
      key: RnTenantCbizConfigKeyType.Init,
      value: 'true',
    });

    // --------------------------------
    // 데이터베이스 초기 작업
    // --------------------------------

    // --------------------------------
    // - Permission 동기화
    // --------------------------------
    const permissionList: string[] = Object.values(RnTenantPermissionAccess)
      .filter((permission) => permission !== RnTenantPermissionAccess.None)
      .reduce<string[]>((acc, permission) => {
        acc.push(`view::${permission}`);
        acc.push(`create::${permission}`);
        acc.push(`update::${permission}`);
        acc.push(`delete::${permission}`);
        return acc;
      }, []);
    const permissionSelectResult = await datasoure
      .getRepository(RnTenantPermissionEntity)
      .find();
    const createTargetPermission = permissionList.filter(
      (permission) =>
        !permissionSelectResult.some((p) => p.name === permission),
    );

    await datasoure.getRepository(RnTenantPermissionEntity).save(
      createTargetPermission.map((p) => ({
        name: p,
        description: `${p} 권한 정보`,
      })),
    );

    // --------------------------------
    // - 메뉴 동기화
    // --------------------------------
    const type = await datasoure
      .getRepository(RnTenantCbizConfigEntity)
      .findOne({
        where: {
          key: RnTenantCbizConfigKeyType.Type,
        },
      });
    const menuTree = getMenuTree();

    // 메뉴 삭제 - FK 제약조건 임시 비활성화
    await datasoure.query('SET FOREIGN_KEY_CHECKS = 0');
    await datasoure.getRepository(RnTenantCbizMenuEntity).clear();
    await datasoure.query('SET FOREIGN_KEY_CHECKS = 1');

    // 지정한 메뉴 트리의 경우 부모의 키가 'menuRefName' 인 경우 부모 메뉴를 찾아서 연결
    const menuData: (RnTenantCbizMenuEntity & {
      parentRefName: string | null;
    })[] = [];
    for (const menu of menuTree) {
      const temp = await datasoure.getRepository(RnTenantCbizMenuEntity).save({
        menuNameOrigin: menu.menuName,
        menuClassifyEm: menu.menuClassifyEm,
        menuActAdd: menu.menuActAdd,
        menuActUp: menu.menuActUp,
        menuActDel: menu.menuActDel,
        menuActApp: menu.menuActApp,
        menuActList: menu.menuActList,
        menuDepth: menu.menuDepth,
        menuSearchJsxcrud: menu.menuSearchJsxcrud,
        menuActOther: menu.menuActOther,
        menuUrl: menu.menuUrl,
        menuName: menu.menuName,
        menuRefName: menu.menuRefName,
        menuTypeEm: menu.menuTypeEm,
        ordNo: menu.ordNo,
        useYn: menu.useYn,
      } as RnTenantCbizMenuEntity);

      menuData.push({
        ...temp,
        parentRefName: menu.parentMenuRefName,
      });
    }

    // 다 생성 후 부모 메뉴 연결
    for (const menu of menuData) {
      let parentMenuId = null;
      if (menu.parentRefName) {
        const parentMenu = menuData.find(
          (m) => m.menuRefName === menu.parentRefName,
        );

        if (parentMenu && parentMenu?.menuRefName) {
          parentMenuId = (
            await datasoure.getRepository(RnTenantCbizMenuEntity).findOne({
              where: {
                menuRefName: parentMenu.menuRefName,
              },
            })
          )?.id;
        }
      }
      if (parentMenuId) {
        await datasoure.getRepository(RnTenantCbizMenuEntity).update(
          {
            id: menu.id,
          },
          {
            parent: { id: parentMenuId },
          },
        );
      }
    }
  } catch (error: any) {
    logger.error(error?.message ?? error);
    throw error;
  }
}
