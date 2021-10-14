export abstract class AbstractType {
  private readonly qualifiedName: string | undefined;

  public constructor(qualifiedName?: string) {
    this.qualifiedName = qualifiedName;
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    return this.qualifiedName;
  }

  public abstract toText(level: number): string;
  public abstract toABAP(): string;
  public abstract isGeneric(): boolean;
  public abstract containsVoid(): boolean;
}