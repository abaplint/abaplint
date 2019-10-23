import {AbstractType} from "./_abstract_type";

export class UnknownType extends AbstractType {
  public toText() {
    return "Unknown type, error";
  }
}