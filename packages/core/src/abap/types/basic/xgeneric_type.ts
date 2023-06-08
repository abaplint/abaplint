import {AbstractType} from "./_abstract_type";

export class XGenericType extends AbstractType {
  public toText() {
    return "```x```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    throw new Error("x, generic");
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_CGENERIC";
  }
}