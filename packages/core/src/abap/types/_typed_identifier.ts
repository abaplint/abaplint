import {Token} from "../1_lexer/tokens/_token";
import {Identifier} from "../4_file_information/_identifier";
import {AbstractType} from "./basic/_abstract_type";

export const enum IdentifierMeta {
  MethodImporting = "importing",
  MethodExporting = "exporting",
  MethodChanging = "changing",
  MethodReturning = "returning",
  EventParameter = "event_parameter",
  FormParameter = "form_parameter",
  ReadOnly = "read_only",
  InlineDefinition = "inline",
  BuiltIn = "built-in",
  DDIC = "ddic",
  Static = "static",
  Enum = "enum",
// todo, MethodPreferred
// todo, Optional
}

export class TypedIdentifier extends Identifier {
  private readonly type: AbstractType;
  private readonly meta: readonly IdentifierMeta[];
  private readonly value: string | {[index: string]: string} | undefined;

  public static from(id: Identifier, type: TypedIdentifier | AbstractType, meta?: readonly IdentifierMeta[]): TypedIdentifier {
    return new TypedIdentifier(id.getToken(), id.getFilename(), type, meta);
  }

  public constructor(token: Token, filename: string, type: TypedIdentifier | AbstractType,
                     meta?: readonly IdentifierMeta[], value?: string | {[index: string]: string}) {
    super(token, filename);

    if (type instanceof TypedIdentifier) {
      this.type = type.getType();
    } else {
      this.type = type;
    }

    this.value = value;
    this.meta = [];
    if (meta) {
      this.meta = meta;
    }
  }

  public toText(): string {
    return "Identifier: ```" + this.getName() + "```";
  }

  public getType(): AbstractType {
    return this.type;
  }

  public getMeta(): readonly IdentifierMeta[] {
    return this.meta;
  }

  public getValue() {
    return this.value;
  }

}