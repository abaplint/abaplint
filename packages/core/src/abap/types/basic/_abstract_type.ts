export type AbstractTypeData = {
  qualifiedName?: string,
  conversionExit?: string,
  ddicName?: string,
};

export abstract class AbstractType {
  private readonly data: AbstractTypeData |undefined;

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