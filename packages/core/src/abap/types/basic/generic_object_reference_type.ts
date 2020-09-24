import {AbstractType} from "./_abstract_type";

export class GenericObjectReferenceType implements AbstractType {

  public toText() {
    return "```REF TO OBJECT```";
  }

  public isGeneric() {
    return true;
  }

  public containsVoid() {
    return false;
  }

  public getIdentifier() {
    return undefined;
  }
}