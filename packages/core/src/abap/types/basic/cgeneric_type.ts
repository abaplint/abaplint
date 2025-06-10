import {AbstractType} from "./_abstract_type";

export class CGenericType extends AbstractType {
  private static readonly singleton = new CGenericType();

  public static get(): CGenericType {
    return this.singleton;
  }

  private constructor() {
    super();
  }

  public toText() {
    return "```c```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    throw new Error("c, generic");
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_CGENERIC";
  }
}