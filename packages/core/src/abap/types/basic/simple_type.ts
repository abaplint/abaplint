import {AbstractType} from "./_abstract_type";

export class SimpleType extends AbstractType {
  private static readonly singleton = new SimpleType();

  public static get(): SimpleType {
    return this.singleton;
  }

  private constructor() {
    super();
  }

  public toText() {
    return "```simple```";
  }

  public toABAP() {
    return "simple";
  }

  public isGeneric() {
    return true;
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_SIMPLE";
  }
}
