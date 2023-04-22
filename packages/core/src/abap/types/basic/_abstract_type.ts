export type AbstractTypeData = {
  qualifiedName?: string,
  conversionExit?: string,
  derivedFromConstant?: boolean,
  ddicName?: string,
  RTTIName?: string,
};

export abstract class AbstractType {
  private readonly data: AbstractTypeData | undefined;

  public constructor(input?: AbstractTypeData) {
    this.data = input;
  }

  public getAbstractTypeData() {
    return this.data;
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    return this.data?.qualifiedName;
  }

  public getRTTIName(): string | undefined {
    return this.data?.RTTIName;
  }

  public getConversionExit(): string | undefined {
    return this.data?.conversionExit;
  }

  public getDDICName(): string | undefined {
    return this.data?.ddicName;
  }

  public abstract toText(level: number): string;
  public abstract toABAP(): string;
  public abstract toCDS(): string;
  public abstract isGeneric(): boolean;
  public abstract containsVoid(): boolean;
}