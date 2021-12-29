import {Identifier} from "../../4_file_information/_identifier";
import {AbstractType} from "./_abstract_type";

// use GenericObjectReferenceType for REF TO OBJECT
export class ObjectReferenceType extends AbstractType {
  private readonly identifier: Identifier;

  public constructor(id: Identifier, qualifiedName?: string) {
    super(qualifiedName);
    this.identifier = id;
  }

  public getIdentifierName() {
    return this.identifier.getName();
  }

  public toText() {
    return "```REF TO " + this.identifier.getName() + "```";
  }

  public toABAP(): string {
    return "REF TO " + this.identifier.getName();
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

  public toCDS() {
    return "abap.TODO_OBJECTREF";
  }
}