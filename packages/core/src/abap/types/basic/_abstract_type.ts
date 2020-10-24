export abstract class AbstractType {
  private readonly name: string | undefined;

  public constructor(name?: string) {
    this.name = name;
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    return this.name;
  }

  abstract toText(level: number): string;
  abstract toABAP(): string;
  abstract isGeneric(): boolean;
  abstract containsVoid(): boolean;
}