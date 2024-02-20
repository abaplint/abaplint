import {AbstractType} from "./_abstract_type";

export class DataType extends AbstractType {
  public toText() {
    return "```data```";
  }

  public toABAP() {
    return "data";
  }

  public isGeneric() {
    return true;
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_DATA";
  }
}