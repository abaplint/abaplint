import {AbstractType} from "./_abstract_type";

export class CharacterType extends AbstractType {
  private readonly length: number;

  public constructor(length: number, qualifiedName?: string) {
    super(qualifiedName);
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

  public toABAP() {
    return "c LENGTH " + this.getLength();
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

  public toCDS() {
    return "abap.char( " + this.getLength() + " )";
  }
}