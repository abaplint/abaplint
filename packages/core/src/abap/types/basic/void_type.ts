import {AbstractType} from "./_abstract_type";

export class VoidType extends AbstractType {
  // this contains the name of the type that was the original reason for the void
  private readonly voided: string | undefined;

  public constructor(voided: string | undefined, qualifiedName?: string) {
    super({qualifiedName: qualifiedName});
    this.voided = voided;
  }

  public getVoided(): string | undefined {
    return this.voided;
  }

  public toABAP(): string {
    return this.voided || "VOIDEDtoABAP";
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

  public toCDS() {
    return "abap.TODO_VOID";
  }
}