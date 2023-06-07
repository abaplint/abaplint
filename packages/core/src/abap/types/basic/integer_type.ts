import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class IntegerType extends AbstractType {
  private static readonly singleton = new IntegerType();

  public static get(input?: AbstractTypeData): IntegerType {
    if (input === undefined) {
      return this.singleton;
    }
    return new IntegerType(input);
  }

  private constructor(input?: AbstractTypeData) {
    super(input);
  }

  /** fully qualified symbolic name of the type */
  public getQualifiedName(): string | undefined {
    const qual = this.data?.qualifiedName;
    if (qual === undefined) {
      return "I";
    }
    return qual;
  }

  public toText() {
    return "```i```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "i";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.int4";
  }
}