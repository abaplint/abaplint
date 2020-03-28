import {AbstractType} from "./_abstract_type";

export class XSequenceType implements AbstractType {
  public toText() {
    return "```xsequence```";
  }

  public isGeneric() {
    return true;
  }
}