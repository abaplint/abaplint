import {AbstractType} from "./_abstract_type";

export class PGenericType extends AbstractType {
  private static readonly singleton = new PGenericType();

  public static get(): PGenericType {
    return this.singleton;
  }

  private constructor() {
    super();
  }

  public toText() {
    return "```p```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    throw new Error("p, generic");
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_PGENERIC";
  }
}
