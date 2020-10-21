import {Identifier} from "../../4_file_information/_identifier";
import {AbstractType} from "./_abstract_type";

// use GenericObjectReferenceType for REF TO OBJECT
export class ObjectReferenceType implements AbstractType {
  private readonly identifier: Identifier;

  public constructor(id: Identifier) {
    this.identifier = id;
  }

  public getName() {
    return this.identifier.getName();
  }

  public toText() {
    return "```REF TO " + this.getName() + "```";
  }

  public toABAP(): string {
    return "REF TO " + this.getName();
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }

  public getIdentifier(): Identifier {
    return this.identifier;
  }
}