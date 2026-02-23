export class ICommonErrorCode {
  constructor(
    public code: string,
    public message: string,
    public status?: number,
    public detail?: string
  ) {}

  toString(): string {
    return (
      `${this.code}: ${this.message}` + (this.detail ? ` - ${this.detail}` : '')
    );
  }
}
