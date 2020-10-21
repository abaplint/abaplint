import {AbstractType} from "./_abstract_type";

export class NumericGenericType implements AbstractType {
  public toText() {
    return "```NUMERIC```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    throw new Error("NumericGenericType, generic");
  }

  public containsVoid() {
    return false;
  }
}