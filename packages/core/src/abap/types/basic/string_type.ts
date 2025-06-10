import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class StringType extends AbstractType {
  private static readonly singletons = new Map<string, StringType>();

  public static get(input?: AbstractTypeData): StringType {
    const key = JSON.stringify(input);
    if (this.singletons.has(key)) {
      return this.singletons.get(key)!;
    }

    const ret = new StringType(input);
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