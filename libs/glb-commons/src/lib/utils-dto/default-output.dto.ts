/**
 * 기본 출력 DTO
 * 모든 출력 DTO는 이 클래스를 상속받아야 한다.
 *
 * @param T 데이터 타입
 * @author 최시훈
 * @since 2025-01-02
 */
export class IDefaultOutputDto<T> {
  message: string;
  data?: T;

  /**
   * 성공 응답 생성
   *
   * @param data 데이터
   * @param message 메시지
   * @returns 성공 응답
   */
  static success<T>(
    data: T,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    message: string = 'success'
  ): IDefaultOutputDto<T> {
    return {
      message,
      data,
    };
  }
}
