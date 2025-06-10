import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class AnyType extends AbstractType {
  private static readonly singletons = new Map<string, AnyType>();

  public static get(input?: AbstractTypeData): AnyType {
    const key = JSON.stringify(input);
    if (this.singletons.has(key)) {
      return this.singletons.get(key)!;
    }

    const ret = new AnyType(input);
    this.singletons.set(key, ret);
    return ret;
  }

  private constructor(input?: AbstractTypeData) {
    super(input);
  }

  public toText() {
    return "```any```";
  }

  public toABAP() {
    return "any";
  }

  public isGeneric() {
    return true;
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_ANY";
  }
}