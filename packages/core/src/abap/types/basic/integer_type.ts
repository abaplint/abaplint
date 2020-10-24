import {AbstractType} from "./_abstract_type";

export class IntegerType extends AbstractType {
  public toText() {
    return "```i```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "i";
  }

  public containsVoid() {
    return false;
  }
}