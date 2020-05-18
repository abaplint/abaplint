import {AbstractType} from "./_abstract_type";

export class AnyType implements AbstractType {
  public toText() {
    return "```any```";
  }

  public isGeneric() {
    return true;
  }
}