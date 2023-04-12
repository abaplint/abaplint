import {AbstractType} from "./_abstract_type";

export class CGenericType extends AbstractType {
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