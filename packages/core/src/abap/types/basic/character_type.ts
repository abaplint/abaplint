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

  public cloneType(qualifiedName?: string, ddicName?: string) {
    const clone = {...this.getAbstractTypeData()} || {};
    if (qualifiedName) {
      clone.qualifiedName = qualifiedName;
    }
    if (ddicName) {
      clone.ddicName = ddicName;
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