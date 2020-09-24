import {AbstractType} from "./_abstract_type";

export class VoidType implements AbstractType {
  // this contains the name of the type that was the original reason for the void
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

  public containsVoid() {
    return true;
  }

  public getIdentifier() {
    return undefined;
  }
}