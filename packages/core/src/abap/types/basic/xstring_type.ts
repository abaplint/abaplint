import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class XStringType extends AbstractType {
  private static readonly singletons = new Map<string, XStringType>();

  public static get(input?: AbstractTypeData): XStringType {
    const key = JSON.stringify(input);
    if (this.singletons.has(key)) {
      return this.singletons.get(key)!;
    }

    const ret = new XStringType(input);
    this.singletons.set(key, ret);
    return ret;
  }

  private constructor(input?: AbstractTypeData) {
    super(input);
  }

  public toText() {
    return "```xstring```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "xstring";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.rawstring";
  }
}