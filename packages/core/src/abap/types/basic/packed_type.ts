import {AbstractType, AbstractTypeData} from "./_abstract_type";

export class PackedType extends AbstractType {
  private readonly length: number;
  private readonly decimals: number;

  public constructor(length: number, decimals: number, extra?: AbstractTypeData) {
    super(extra);
    if (length <= 0) {
      throw new Error("Bad LENGTH, Packed");
    } else if (decimals < 0) {
      throw new Error("Bad DECIMALS, Packed");
    }
    this.length = length;
    this.decimals = decimals;
  }

  public getLength() {
    return this.length;
  }

  public getDecimals() {
    return this.decimals;
  }

  public toText() {
    return "```p LENGTH " + this.getLength() + " DECIMALS " + this.getDecimals() + "```";
  }

  public toABAP(): string {
    return "p LENGTH " + this.getLength() + " DECIMALS " + this.getDecimals();
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }

  public toCDS() {
    return "abap.TODO_PACKED";
  }
}