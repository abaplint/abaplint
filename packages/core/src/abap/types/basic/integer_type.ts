import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class IntegerType extends AbstractType {
  private static readonly singletons = new Map<string, IntegerType>();

  public static get(input?: AbstractTypeData): IntegerType {
    const key = JSON.stringify(input);
    if (this.singletons.has(key)) {
      return this.singletons.get(key)!;
    }

    const ret = new IntegerType(input);
    this.singletons.set(key, ret);
    return ret;
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