import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT 토큰 페이로드
 *
 * @author 최시훈
 */
export interface JwtPayload {
  id: string;
  userId: string;
  userName: string;
  tenantId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  /**
   * JWT 토큰 검증
   *
   * @param payload JWT 토큰 페이로드
   * @returns JWT 토큰 페이로드
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return {
      id: payload.id,
      userId: payload.userId,
      tenantId: payload.tenantId,
      userName: payload.userName,
    };
  }
}
