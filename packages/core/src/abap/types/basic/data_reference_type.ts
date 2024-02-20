import {AbstractType} from "./_abstract_type";
import {AnyType} from "./any_type";

export class DataReference extends AbstractType {
  private readonly type: AbstractType;

  public constructor(type: AbstractType, qualifiedName?: string) {
    super({qualifiedName: qualifiedName});
    this.type = type;
  }

  public toText(level: number) {
    return "Data REF TO " + this.type.toText(level + 1);
  }

  public getType(): AbstractType {
    return this.type;
  }

  public toABAP(): string {
    const type = this.type.toABAP();
    if (type.includes(" TABLE OF ")) {
      return ""; // hmm, should this return undefined?
    }
    return "REF TO " + this.type.toABAP();
  }

  public isGeneric() {
    if (this.type instanceof AnyType) {
      return true;
    }
    return false;
  }

  public containsVoid() {
    return this.type.containsVoid();
  }

  public toCDS() {
    return "abap.TODO_REFERENCE";
  }
}