import {AbstractType} from "./_abstract_type";

export class XSequenceType implements AbstractType {
  public toText() {
    return "```xsequence```";
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