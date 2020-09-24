import {Identifier} from "../../4_file_information/_identifier";
import {AbstractType} from "./_abstract_type";

export class ObjectReferenceType implements AbstractType {
  private readonly name: string;

  public constructor(id: Identifier) {
    this.name = id.getName();
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