import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class AnyType extends AbstractType {
  private static readonly singleton = new AnyType();

  public static get(input?: AbstractTypeData): AnyType {
    if (input === undefined) {
      return this.singleton;
    }
    return new AnyType(input);
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