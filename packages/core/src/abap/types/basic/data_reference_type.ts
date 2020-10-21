import {TypedIdentifier} from "../_typed_identifier";
import {AbstractType} from "./_abstract_type";

export class DataReference implements AbstractType {
  private readonly type: AbstractType;

  public constructor(type: AbstractType | TypedIdentifier) {
    if (type instanceof TypedIdentifier) {
      this.type = type.getType();
    } else {
      this.type = type;
    }
  }

  public toText(level: number) {
    return "Data REF TO " + this.type.toText(level + 1);
  }

  public getType(): AbstractType {
    return this.type;
  }

  public toABAP(): string {
    return "REF TO " + this.type;
  }

  public isGeneric() {
    return this.type.isGeneric();
  }

  public containsVoid() {
    return this.type.containsVoid();
  }
}