import {AbstractType} from "./_abstract_type";

export class VoidType implements AbstractType {
  private readonly voided: string | undefined;

  public constructor(voided: string | undefined) {
    this.voided = voided;
  }

  public getVoided(): string | undefined {
    return this.voided;
  }

  public toText() {
    return "Void(" + this.voided + ")";
  }

  public isGeneric() {
    return false;
  }
}