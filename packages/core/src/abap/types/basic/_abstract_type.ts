export abstract class AbstractType {
  private readonly qualifiedName: string | undefined;

  public constructor(qualifiedName?: string) {
    this.qualifiedName = qualifiedName;
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    return this.qualifiedName;
  }

  abstract toText(level: number): string;
  abstract toABAP(): string;
  abstract isGeneric(): boolean;
  abstract containsVoid(): boolean;
}