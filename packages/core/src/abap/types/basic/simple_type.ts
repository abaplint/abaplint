import {AbstractType} from "./_abstract_type";

export class SimpleType extends AbstractType {
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