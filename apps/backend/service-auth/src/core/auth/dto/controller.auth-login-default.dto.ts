import { IsString } from '@capstone-project/glb-commons';

export class ControllerAuthLoginDefaultDto {
  @IsString({
    min: 1,
    max: 100,
    propertyName: 'userId',
    example: 'userId',
    description: '사용자 아이디',
  })
  userId: string;

  @IsString({
    min: 8,
    max: 100,
    propertyName: 'password',
    example: 'password1234',
    description: '비밀번호',
  })
  password: string;
}
