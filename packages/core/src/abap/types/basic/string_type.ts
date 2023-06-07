import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class StringType extends AbstractType {
  private static readonly singleton = new StringType();

  public static get(input?: AbstractTypeData): StringType {
    if (input === undefined) {
      return this.singleton;
    }
    return new StringType(input);
  }

  private constructor(input?: AbstractTypeData) {
    super(input);
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    const qual = this.data?.qualifiedName;
    if (qual === undefined) {
      return "STRING";
    }
    return qual;
  }

  public toText() {
    return "```string```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "string";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.string";
  }
}