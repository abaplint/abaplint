import {AbstractType} from "./_abstract_type";

export class TimeType implements AbstractType {
  public toText() {
    return "```t```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "t";
  }

  public containsVoid() {
    return false;
  }
}