import {Token} from "../tokens/_token";
import {Identifier} from "./_identifier";
import {AbstractType} from "./basic/_abstract_type";

export class TypedIdentifier extends Identifier {
  private readonly type: AbstractType;

  constructor(token: Token, filename: string, type: AbstractType) {
    super(token, filename);
    this.type = type;
  }

  public getType(): AbstractType {
    return this.type;
  }

}