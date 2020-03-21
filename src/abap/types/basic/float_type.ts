import {AbstractType} from "./_abstract_type";

export class FloatType implements AbstractType {
  public toText() {
    return "```f```";
  }

  public isGeneric() {
    return false;
  }
}