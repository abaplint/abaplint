import {Token} from "../1_lexer/tokens/_token";
import {Identifier} from "./_identifier";
import {AbstractType} from "./basic/_abstract_type";

export const enum IdentifierMeta {
  MethodImporting = "importing",
  MethodExporting = "exporting",
  MethodChanging = "changing",
  MethodReturning = "returning",
  ReadOnly = "read_only",
// todo, MethodPreferred
// todo, Optional
}

export class TypedIdentifier extends Identifier {
  private readonly type: AbstractType;
  private readonly meta: IdentifierMeta[];
  private readonly value: string | undefined;

  public constructor(token: Token, filename: string, type: AbstractType, meta?: IdentifierMeta[], value?: string) {
    super(token, filename);
    this.type = type;
    this.value = value;
    this.meta = [];
    if (meta) {
      this.meta = meta;
    }
  }

  public getType(): AbstractType {
    return this.type;
  }

  public getMeta() {
    return this.meta;
  }

  public getValue() {
    return this.value;
  }
}