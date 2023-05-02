import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class CharacterType extends AbstractType {
  private readonly length: number;

  public constructor(length: number, extra?: AbstractTypeData) {
    super(extra);
    if (length <= 0) {
      throw new Error("Bad LENGTH");
    }
    this.length = length;
  }

  public cloneType(input: {qualifiedName?: string, ddicName?: string, derivedFromConstant?: boolean}) {
    const clone = {...this.getAbstractTypeData()} || {};
    if (input.qualifiedName) {
      clone.qualifiedName = input.qualifiedName;
    }
    if (input.ddicName) {
      clone.ddicName = input.ddicName;
    }
    if (input.derivedFromConstant) {
      clone.derivedFromConstant = input.derivedFromConstant;
    }
    return new CharacterType(this.length, clone);
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