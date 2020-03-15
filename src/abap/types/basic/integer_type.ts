import {AbstractType} from "./_abstract_type";

export class IntegerType extends AbstractType {
  public toText() {
    return "```i```";
  }

  public isGeneric() {
    return false;
  }
}