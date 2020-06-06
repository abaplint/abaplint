import {AbstractType} from "./_abstract_type";

export class ObjectReferenceType implements AbstractType {
  private readonly name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public getName() {
    return this.name;
  }

  public toText() {
    return "```REF TO " + this.name + "```";
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }
}