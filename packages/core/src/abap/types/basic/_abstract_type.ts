export abstract class AbstractType {
  private readonly qualifiedName: string | undefined;
  private readonly conversionExit: string | undefined;

  public constructor(qualifiedName?: string, conversionExit?: string) {
    this.qualifiedName = qualifiedName;
    this.conversionExit = conversionExit;
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    return this.qualifiedName;
  }

  public getConversionExit(): string | undefined {
    return this.conversionExit;
  }

  public abstract toText(level: number): string;
  public abstract toABAP(): string;
  public abstract toCDS(): string;
  public abstract isGeneric(): boolean;
  public abstract containsVoid(): boolean;
}