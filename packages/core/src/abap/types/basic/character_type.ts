import {AbstractType} from "./_abstract_type";

export class CharacterType implements AbstractType {
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
    return "```c LENGTH " + this.getLength() + "```";
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