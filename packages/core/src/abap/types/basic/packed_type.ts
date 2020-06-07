import {AbstractType} from "./_abstract_type";

export class PackedType implements AbstractType {
  private readonly length: number;
  private readonly decimals: number;

  public constructor(length: number, decimals: number) {
    if (length <= 0) {
      throw new Error("Bad LENGTH");
    } else if (decimals < 0) {
      throw new Error("Bad DECIMALS");
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

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return false;
  }
}