import { ICommonErrorCode } from '../core-response/utils/common-error-code.util';
import { CommonError } from '../core-response/utils/common-error.util';

export class GlbOptionalValue<T> {
  constructor(private readonly _value: T) {}

  static isNull(value: any): boolean {
    return value === null;
  }

  static isUndefined(value: any): boolean {
    return value === undefined;
  }

  static isNaN(value: any): boolean {
    return Number.isNaN(value);
  }

  static isEmpty(value: any): boolean {
    return this.isNull(value) || this.isUndefined(value) || this.isNaN(value);
  }

  static isNotEmpty(value: any): boolean {
    return !this.isEmpty(value);
  }

  get value(): T {
    return this._value;
  }

  isNull(): boolean {
    return this._value === null;
  }

  isUndefined(): boolean {
    return this._value === undefined;
  }

  isNaN(): boolean {
    return Number.isNaN(this._value);
  }

  isEmpty(): boolean {
    return this.isNull() || this.isUndefined() || this.isNaN();
  }

  isNotEmpty(): boolean {
    return !this.isEmpty();
  }

  static of<T>(value: T): GlbOptionalValue<T> {
    return new GlbOptionalValue<T>(value);
  }

  static getValueAndEmptyThrowError<T>(
    value: GlbOptionalValue<T>,
    error: ICommonErrorCode,
  ): NonNullable<T> {
    if (value.isEmpty()) {
      throw error;
    }

    // null 타입 제거
    // null이나 undefined가 아닌 경우에만 값을 반환
    if (value?.value === null || value?.value === undefined) {
      throw CommonError.createByErrorCode(error);
    }

    return value.value;
  }

  static getOptionalValueAndEmptyNull<T>(value: GlbOptionalValue<T>): T | null {
    return value.isEmpty() ? null : value.value;
  }
}
