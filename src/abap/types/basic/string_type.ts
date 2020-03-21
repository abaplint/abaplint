import {AbstractType} from "./_abstract_type";

export class StringType implements AbstractType {
  public toText() {
    return "```string```";
  }

  public isGeneric() {
    return false;
  }
}