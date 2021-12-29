import {AbstractType} from "./_abstract_type";

export class EnumType extends AbstractType {
  public toText() {
    return "enum";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "enum";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_ENUM";
  }
}