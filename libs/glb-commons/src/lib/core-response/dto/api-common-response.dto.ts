import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class IApiCommonRequestUser {
  @ApiProperty({
    description: '사용자 아이디',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '사용자 아이디',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '사용자 이름',
  })
  @IsString()
  userName: string;
}

export class IApiCommonResponse<T> {
  @ApiProperty({
    description: '응답 데이터',
  })
  @IsString()
  @IsOptional()
  data: T;

  @ApiProperty({
    description: '응답 시간',
  })
  @IsString()
  timestamp?: string;

  @ApiProperty({
    description: '요청 경로',
  })
  path?: string;

  @ApiProperty({
    description: '요청 사용자',
  })
  @IsOptional()
  @Type(() => IApiCommonRequestUser)
  requestUser?: null | IApiCommonRequestUser;

  @ApiProperty({
    description: '응답 상태',
  })
  status: HttpStatus;

  @ApiProperty({
    description: '응답 결과 코드',
  })
  @IsString()
  resultCode: string;

  @ApiProperty({
    description: '응답 메시지',
  })
  @IsString()
  message: string;
}
