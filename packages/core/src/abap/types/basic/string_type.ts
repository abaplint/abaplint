import {AbstractType} from "./_abstract_type";

export class StringType extends AbstractType {
  public toText() {
    return "```string```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "string";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.string";
  }
}