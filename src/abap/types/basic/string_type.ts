import {AbstractType} from "./_abstract_type";

export class StringType extends AbstractType {
  public toText() {
    return "```string```";
  }
}