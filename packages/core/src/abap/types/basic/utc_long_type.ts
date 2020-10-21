import {AbstractType} from "./_abstract_type";

export class UTCLongType implements AbstractType {
  public toText() {
    return "```utclong```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "utclong";
  }

  public containsVoid() {
    return false;
  }
}