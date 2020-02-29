import {Token} from "../tokens/_token";
import {AbstractType} from "./basic/_abstract_type";
import {TypedIdentifier} from "./_typed_identifier";

export class TypedConstantIdentifier extends TypedIdentifier {
  private readonly value: string;

  public constructor(token: Token, filename: string, type: AbstractType, value: string) {
    super(token, filename, type);
    this.value = value;
  }

  public getValue() {
    return this.value;
  }

}