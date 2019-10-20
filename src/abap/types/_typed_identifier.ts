import {Token} from "../tokens/_token";
import {Identifier} from "./_identifier";
import {BasicType} from "./basic/_basic_type";

export class TypedIdentifier extends Identifier {
  private readonly type: BasicType;

  constructor(token: Token, filename: string, type: BasicType) {
    super(token, filename);
    this.type = type;
  }

  public getType(): BasicType {
    return this.type;
  }

}