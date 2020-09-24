import {AbstractType} from "./_abstract_type";

export class DateType implements AbstractType {
  public toText() {
    return "```d```";
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }

  public getIdentifier() {
    return undefined;
  }
}