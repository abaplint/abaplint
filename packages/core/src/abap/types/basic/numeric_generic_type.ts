import {AbstractType} from "./_abstract_type";

export class NumericGenericType extends AbstractType {
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

  public toCDS() {
    return "abap.TODO_NUMERICGENERIC";
  }
}