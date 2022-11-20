export abstract class AbstractType {
  private readonly qualifiedName: string | undefined;
  private readonly conversionExit: string | undefined;
  private readonly ddicName: string | undefined;

  public constructor(qualifiedName?: string, conversionExit?: string, ddicName?: string) {
    this.qualifiedName = qualifiedName;
    this.conversionExit = conversionExit;
    this.ddicName = ddicName;
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    return this.qualifiedName;
  }

  public getConversionExit(): string | undefined {
    return this.conversionExit;
  }

  public getDDICName(): string | undefined {
    return this.ddicName;
  }

  public abstract toText(level: number): string;
  public abstract toABAP(): string;
  public abstract toCDS(): string;
  public abstract isGeneric(): boolean;
  public abstract containsVoid(): boolean;
}