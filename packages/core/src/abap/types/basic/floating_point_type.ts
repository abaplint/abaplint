import {AbstractType} from "./_abstract_type";

// this is the DDIC floating point type

export class FloatingPointType implements AbstractType {
  private readonly length: number;

  public constructor(length: number) {
    if (length <= 0) {
      throw new Error("Bad LENGTH");
    }
    this.length = length;
  }

  public getLength() {
    return this.length;
  }

  public toText() {
    return "```n LENGTH " + this.getLength() + "```";
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }
}