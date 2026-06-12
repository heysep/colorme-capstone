import {
  CommonError,
  IDefaultOutputDto,
  PcUserAuthType,
  RnDefaultPcUserEntity,
  cipherHash,
  cipherIsHashValid,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { PersonalColorError } from '../error/personal-color.error';
import { PcAuthProfileResponseDto } from '../dto/personal-color.dto';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

@Injectable()
export class PersonalColorAuthService {
  constructor(
    @InjectRepository(RnDefaultPcUserEntity)
    private readonly pcUserRepository: Repository<RnDefaultPcUserEntity>,
  ) {}

  /**
   * 회원가입.
   * 게스트 세션 토큰이 함께 오면 해당 게스트를 회원으로 승격해
   * 기존 분석/룩 이력을 그대로 이어받는다.
   */
  async signup(options: {
    userId: string;
    password: string;
    userName: string;
    userCountry?: string;
    sessionToken?: string;
  }): Promise<IDefaultOutputDto<PcAuthProfileResponseDto>> {
    const userId = options.userId.trim().toLowerCase();
    if (!EMAIL_REGEX.test(userId)) {
      throw CommonError.createByErrorCode(
        PersonalColorError.AUTH_LOGIN_FAILED,
        '이메일 형식이 올바르지 않습니다.',
      );
    }
    if (!PASSWORD_REGEX.test(options.password)) {
      throw CommonError.createByErrorCode(
        PersonalColorError.AUTH_LOGIN_FAILED,
        '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.',
      );
    }

    const duplicated = await this.pcUserRepository.findOne({
      where: { userId },
    });
    if (duplicated) {
      throw CommonError.createByErrorCode(
        PersonalColorError.AUTH_DUPLICATE_USER_ID,
      );
    }

    const hashedPassword = await cipherHash(options.password);

    // 게스트 세션 승격 경로
    if (options.sessionToken) {
      const guest = await this.pcUserRepository.findOne({
        where: { sessionToken: options.sessionToken },
        relations: { personalColor: true },
      });
      if (guest) {
        if (guest.authType === PcUserAuthType.REGISTERED) {
          throw CommonError.createByErrorCode(
            PersonalColorError.AUTH_ALREADY_REGISTERED,
          );
        }
        guest.userId = userId;
        guest.userPw = hashedPassword;
        guest.userName = options.userName;
        guest.userCountry = options.userCountry ?? null;
        guest.authType = PcUserAuthType.REGISTERED;
        const upgraded = await this.pcUserRepository.save(guest);
        return IDefaultOutputDto.success(this.toProfile(upgraded));
      }
    }

    const created = await this.pcUserRepository.save({
      authType: PcUserAuthType.REGISTERED,
      sessionToken: `pc-${randomUUID()}`,
      userId,
      userPw: hashedPassword,
      userName: options.userName,
      userGender: null,
      userAge: null,
      userCountry: options.userCountry ?? null,
      personalColor: null,
    });

    return IDefaultOutputDto.success(this.toProfile(created));
  }

  /**
   * 로그인. 성공 시 세션 토큰을 새로 발급(회전)한다.
   */
  async login(options: {
    userId: string;
    password: string;
  }): Promise<IDefaultOutputDto<PcAuthProfileResponseDto>> {
    const userId = options.userId.trim().toLowerCase();
    const user = await this.pcUserRepository.findOne({
      where: { userId, authType: PcUserAuthType.REGISTERED },
      relations: { personalColor: true },
    });

    if (!user || !user.userPw) {
      throw CommonError.createByErrorCode(PersonalColorError.AUTH_LOGIN_FAILED);
    }

    const valid = await cipherIsHashValid(options.password, user.userPw);
    if (!valid) {
      throw CommonError.createByErrorCode(PersonalColorError.AUTH_LOGIN_FAILED);
    }

    user.sessionToken = `pc-${randomUUID()}`;
    const saved = await this.pcUserRepository.save(user);

    return IDefaultOutputDto.success(this.toProfile(saved));
  }

  /**
   * 세션 토큰으로 내 프로필 조회.
   */
  async me(
    sessionToken?: string,
  ): Promise<IDefaultOutputDto<PcAuthProfileResponseDto>> {
    if (!sessionToken) {
      throw CommonError.createByErrorCode(
        PersonalColorError.SESSION_TOKEN_REQUIRED,
      );
    }
    const user = await this.pcUserRepository.findOne({
      where: { sessionToken, authType: PcUserAuthType.REGISTERED },
      relations: { personalColor: true },
    });
    if (!user) {
      throw CommonError.createByErrorCode(PersonalColorError.SESSION_NOT_FOUND);
    }
    return IDefaultOutputDto.success(this.toProfile(user));
  }

  private toProfile(user: RnDefaultPcUserEntity): PcAuthProfileResponseDto {
    return {
      sessionToken: user.sessionToken,
      userId: user.userId ?? '',
      userName: user.userName ?? '',
      userCountry: user.userCountry,
      seasonName: user.personalColor?.seasonName ?? null,
    };
  }
}
