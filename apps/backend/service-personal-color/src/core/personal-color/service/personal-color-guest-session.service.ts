import {
  CommonError,
  IDefaultOutputDto,
  PcUserAuthType,
  RnDefaultPcUserEntity,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { PersonalColorError } from '../error/personal-color.error';

@Injectable()
export class PersonalColorGuestSessionService {
  constructor(
    @InjectRepository(RnDefaultPcUserEntity)
    private readonly pcUserRepository: Repository<RnDefaultPcUserEntity>,
  ) {}

  async getOrCreateGuestSession(
    sessionToken?: string,
  ): Promise<IDefaultOutputDto<RnDefaultPcUserEntity>> {
    if (sessionToken) {
      const user = await this.pcUserRepository.findOne({
        where: {
          sessionToken,
        },
      });

      if (!user) {
        throw CommonError.createByErrorCode(PersonalColorError.SESSION_NOT_FOUND);
      }

      return IDefaultOutputDto.success(user);
    }

    const guestUser = await this.pcUserRepository.save({
      authType: PcUserAuthType.GUEST,
      sessionToken: `pc-${randomUUID()}`,
      userId: null,
      userPw: null,
      userName: null,
      userGender: null,
      userAge: null,
      userCountry: null,
      personalColor: null,
    });

    return IDefaultOutputDto.success(guestUser);
  }

  async getRequiredSessionUser(
    sessionToken?: string,
  ): Promise<IDefaultOutputDto<RnDefaultPcUserEntity>> {
    if (!sessionToken) {
      throw CommonError.createByErrorCode(
        PersonalColorError.SESSION_TOKEN_REQUIRED,
      );
    }

    const user = await this.pcUserRepository.findOne({
      where: {
        sessionToken,
      },
      relations: {
        personalColor: true,
      },
    });

    if (!user) {
      throw CommonError.createByErrorCode(PersonalColorError.SESSION_NOT_FOUND);
    }

    return IDefaultOutputDto.success(user);
  }
}
