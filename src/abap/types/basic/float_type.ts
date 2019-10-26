import {AbstractType} from "./_abstract_type";

export class FloatType extends AbstractType {
  public toText() {
    return "```f```";
  }
}