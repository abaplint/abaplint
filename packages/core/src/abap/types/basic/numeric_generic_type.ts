import {AbstractType} from "./_abstract_type";

export class NumericGenericType implements AbstractType {
  public toText() {
    return "```NUMERIC```";
  }

  public isGeneric() {
    return true;
  }

  public containsVoid() {
    return false;
  }
}