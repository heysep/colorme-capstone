import { SetMetadata } from '@nestjs/common';

export const UserStatus = {
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

/**
 * 사용자 상태가 다음 상태인 경우 예외 발생
 *
 * @param status 사용자 상태
 * @returns 사용자 상태
 */
export const IsNotOnlyUserStatus = (
  status: (typeof UserStatus)[keyof typeof UserStatus][]
) => {
  return SetMetadata('userStatus', status);
};
