import {Token} from "../tokens/_token";
import {BasicType} from "./basic/_basic_type";
import {TypedIdentifier} from "./_typed_identifier";

export class TypedConstantIdentifier extends TypedIdentifier {
  private readonly value: string;

  constructor(token: Token, filename: string, type: BasicType, value: string) {
    super(token, filename, type);
    this.value = value;
  }

  public getValue() {
    return this.value;
  }

}