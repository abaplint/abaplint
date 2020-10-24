import {AbstractType} from "./_abstract_type";

export class DateType extends AbstractType {
  public toText() {
    return "```d```";
  }

  public isGeneric() {
    return false;
  }

  public toABAP(): string {
    return "d";
  }

  public containsVoid() {
    return false;
  }
}