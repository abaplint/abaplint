import {AbstractType} from "./_abstract_type";

export class UTCLongType extends AbstractType {
  public toText() {
    return "```utclong```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "utclong";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_UTCLONG";
  }
}