import {Token} from "../tokens/_token";
import {Identifier} from "./_identifier";
import {AbstractType} from "./basic/_abstract_type";

export const enum IdentifierMeta {
  MethodImporting = "importing",
  MethodExporting = "exporting",
  MethodChanging = "changing",
  MethodReturning = "returning",
}

export class TypedIdentifier extends Identifier {
  private readonly type: AbstractType;
  private readonly meta?: IdentifierMeta;

  public constructor(token: Token, filename: string, type: AbstractType, meta?: IdentifierMeta) {
    super(token, filename);
    this.type = type;
    this.meta = meta;
  }

  public getType(): AbstractType {
    return this.type;
  }

  public getMeta() {
    return this.meta;
  }
}