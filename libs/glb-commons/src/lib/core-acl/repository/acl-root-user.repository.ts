import { Injectable } from '@nestjs/common';
import { RnDefaultRootUserEntity } from '../../core-typeorm/entity/default/rn-default-user.mysql-entity';
import { RnDefaultRootUserRepository } from '../../core-typeorm/repository/default/rn-default-root-user.repository';
import { GlbOptionalValue } from '../../utils-optional/utils-optional.util';

@Injectable()
export class GlbCoreAclRootUserRepository {
  constructor(private readonly repository: RnDefaultRootUserRepository) {}

  /**
   * 사용자 아이디를 기반으로 사용자 정보를 조회합니다.
   *
   * @param options 사용자 아이디
   * @returns 사용자 정보
   */
  async findOneByUserId(options: {
    userId: string;
  }): Promise<GlbOptionalValue<RnDefaultRootUserEntity | null>> {
    const value = await this.repository.repository.findOne({
      withDeleted: false,
      where: {
        userId: options.userId,
      },
    });

    return GlbOptionalValue.of(value);
  }

  /**
   * 사용자 고유 아이디로 루트 사용자 조회
   *
   * @param options 사용자 고유 아이디
   * @returns 사용자 조회 결과
   */
  async findOneByUniqueId(options: {
    uniqueId: string;
  }): Promise<GlbOptionalValue<RnDefaultRootUserEntity | null>> {
    const value = await this.repository.repository.findOne({
      withDeleted: false,
      where: {
        id: options.uniqueId,
      },
    });

    return GlbOptionalValue.of(value);
  }

  /**
   * 사용자 마지막 로그인 시간 업데이트
   *
   * @param options 사용자 아이디
   */
  async updateLastLoginAt(options: { id: string }): Promise<void> {
    await this.repository.repository.update(
      {
        id: options.id,
      },
      {
        lastLoginAt: new Date(),
      },
    );
  }
}
