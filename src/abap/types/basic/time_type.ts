import {AbstractType} from "./_abstract_type";

export class TimeType extends AbstractType {
  public toText() {
    return "```t```";
  }
}