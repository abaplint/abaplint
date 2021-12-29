import {AbstractType} from "./_abstract_type";

export class GenericObjectReferenceType extends AbstractType {

  public toText() {
    return "```REF TO object```";
  }

  public isGeneric() {
    return true;
  }

  public toABAP(): string {
    return "REF TO object";
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_GENERICOBJECTREF";
  }
}