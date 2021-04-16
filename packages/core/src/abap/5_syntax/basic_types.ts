/* eslint-disable default-case */
import {TypedIdentifier} from "../types/_typed_identifier";
import {StatementNode, ExpressionNode} from "../nodes";
import * as Expressions from "../2_statements/expressions";
import * as Types from "../types/basic";
import {CurrentScope} from "./_current_scope";
import {AbstractType} from "../types/basic/_abstract_type";
import {ScopeType} from "./_scope_type";
import {ObjectOriented} from "./_object_oriented";
import {ClassConstant} from "../types/class_constant";
import {Identifier} from "../1_lexer/tokens/identifier";
import {ReferenceType} from "./_reference";
import {TableType, VoidType} from "../types/basic";
import {FieldChain} from "./expressions/field_chain";
import {ClassDefinition} from "../types";

export class BasicTypes {
  private readonly filename: string;
  private readonly scope: CurrentScope;

  public constructor(filename: string, scope: CurrentScope) {
    this.filename = filename;
    this.scope = scope;
  }

  public lookupQualifiedName(name: string | undefined): TypedIdentifier | undefined {
    if (name === undefined) {
      return undefined;
    }

    const found = this.scope.findType(name);
    if (found) {
      return found;
    }

    if (name.includes("=>")) {
      const split = name.split("=>");
      const ooName = split[0];
      const typeName = split[1];
      const oo = this.scope.findObjectDefinition(ooName);
      if (oo) {
        const f = oo.getTypeDefinitions().getByName(typeName);
        if (f) {
          return f;
        }
      }
    }

// todo: DDIC types

    return undefined;
  }

  public resolveLikeName(node: ExpressionNode | StatementNode | undefined, headerLogic = true): AbstractType | undefined {
    if (node === undefined) {
      return undefined;
    }

    let chain = node.findFirstExpression(Expressions.FieldChain);
    if (chain === undefined) {
      chain = node.findFirstExpression(Expressions.TypeName);
    }
    const fullName = chain?.concatTokens();
    const children = chain?.getChildren();

    if (children === undefined) {
      return new Types.UnknownType("Type error, could not resolve \"" + fullName + "\", resolveLikeName1");
    } else if (chain === undefined) {
      throw new Error("resolveLikeName, chain undefined");
    }

    let type: AbstractType | undefined = undefined;
    if (children[1] && ( children[1].getFirstToken().getStr() === "=>" || children[1].getFirstToken().getStr() === "->")) {
      type = new FieldChain().runSyntax(chain, this.scope, this.filename, ReferenceType.TypeReference);
    } else {
      const name = children[0].getFirstToken().getStr();
      const found = this.scope.findVariable(name);
      type = found?.getType();

      if (found) {
        this.scope.addReference(chain?.getFirstToken(), found, ReferenceType.TypeReference, this.filename);
      }

      if (type instanceof TableType && chain.getLastChild()?.get() instanceof Expressions.TableBody) {
        type = new TableType(type.getRowType(), false);
      } else if (type instanceof TableType && type.isWithHeader() && headerLogic === true) {
        type = type.getRowType();
      } else if (type === undefined) {
        type = this.scope.getDDIC().lookupNoVoid(name);
      }

      // todo, this only looks up one level, reuse field_chain.ts?
      if (children[1] && children[2] && children[1].getFirstToken().getStr() === "-") {
        if (type instanceof Types.StructureType) {
          const sub = type.getComponentByName(children[2].getFirstToken().getStr());
          if (sub) {
            return sub;
          }
          return new Types.UnknownType("Type error, field not part of structure " + fullName);
        } else if (type instanceof Types.VoidType) {
          return type;
        } else if (type instanceof Types.TableType
            && type.isWithHeader() === true
            && type.getRowType() instanceof Types.VoidType) {
          return type.getRowType();
        } else if (type instanceof Types.TableType
            && type.isWithHeader() === true) {
          const rowType = type.getRowType();
          if (rowType instanceof Types.StructureType) {
            const sub = rowType.getComponentByName(children[2].getFirstToken().getStr());
            if (sub) {
              return sub;
            }
          }
          return new Types.UnknownType("Type error, field not part of structure " + fullName);
        } else {
          if (this.scope.isOO() === false && this.scope.getDDIC().inErrorNamespace(name) === false) {
            this.scope.addReference(children[0].getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
            return new Types.VoidType(name);
          }
          return new Types.UnknownType("Type error, not a structure type " + name);
        }
      }
    }

    if (!type) {
      if (this.scope.isOO() === false && this.scope.getDDIC().inErrorNamespace(fullName) === false) {
        this.scope.addReference(children[0].getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
        return new Types.VoidType(fullName);
      }
      return new Types.UnknownType("Type error, could not resolve \"" + fullName + "\", resolveLikeName2");
    }

    return type;
  }

  public resolveTypeName(typeName: ExpressionNode | undefined, length?: number): AbstractType | undefined {
    if (typeName === undefined) {
      return undefined;
    }

    const chain = this.resolveTypeChain(typeName);
    if (chain) {
      return chain;
    }

    const chainText = typeName.concatTokens().toUpperCase();
    switch (chainText) {
      case "STRING":
        return new Types.StringType();
      case "XSTRING":
        return new Types.XStringType();
      case "D":
        return new Types.DateType();
      case "T":
        return new Types.TimeType();
      case "XSEQUENCE":
        return new Types.XSequenceType();
      case "CLIKE":
        return new Types.CLikeType();
      case "ANY":
        return new Types.AnyType();
      case "DATA":
        return new Types.AnyType();
      case "NUMERIC":
        return new Types.NumericGenericType();
      case "UTCLONG": // todo, take version into account
        return new Types.UTCLongType();
      case "DECFLOAT16":
        return new Types.DecFloat16Type();
      case "DECFLOAT34":
        return new Types.DecFloat34Type();
      case "CSEQUENCE":
        return new Types.CSequenceType();
      case "I":
      case "INT8": // todo, take version into account
        return new Types.IntegerType();
      case "F":
        return new Types.FloatType();
      case "P":
        return new Types.PackedType(1, 1); // todo, length and decimals
      case "C":
        if (length) {
          return new Types.CharacterType(length);
        } else {
          return new Types.CharacterType(1);
        }
      case "X":
        if (length) {
          return new Types.HexType(length);
        } else {
          return new Types.HexType(1);
        }
      case "N":
        if (length) {
          return new Types.NumericType(length);
        } else {
          return new Types.NumericType(1);
        }
    }

    const typ = this.scope.findType(chainText);
    if (typ) {
      const token = typeName.getFirstToken();

      if (chainText.includes("~")) {
        const name = chainText.split("~")[0];
        const idef = this.scope.findInterfaceDefinition(name);
        if (idef) {
          this.scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, this.filename, {ooType: "INTF", ooName: name});
        }
      }

      this.scope.addReference(token, typ, ReferenceType.TypeReference, this.filename);
      return typ.getType();
    }

    const ddic = this.scope.getDDIC().lookup(chainText);
    if (ddic) {
      if (ddic instanceof TypedIdentifier) {
        this.scope.addReference(typeName.getFirstToken(), ddic, ReferenceType.TypeReference, this.filename);
      } else if (ddic instanceof VoidType) {
        this.scope.addReference(typeName.getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
      }
      return ddic;
    }

    return undefined;
  }

  public simpleType(node: StatementNode | ExpressionNode): TypedIdentifier | undefined {
    let nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      nameExpr = node.findFirstExpression(Expressions.DefinitionName);
    }
    if (nameExpr === undefined) {
      return undefined;
    }
    let name = nameExpr.getFirstToken();
    if (nameExpr.countTokens() > 1) { // workaround for names with dashes
      name = new Identifier(name.getStart(), nameExpr.concatTokens());
    }

    const found = this.parseType(node);
    if (found) {
      return new TypedIdentifier(name, this.filename, found);
    }

    return undefined;
  }

  public parseType(node: ExpressionNode | StatementNode, name?: string): AbstractType | undefined {
    const typename = node.findFirstExpression(Expressions.TypeName);

    let text = node.findFirstExpression(Expressions.Type)?.concatTokens().toUpperCase();
    if (text === undefined) {
      text = node.findFirstExpression(Expressions.TypeParam)?.concatTokens().toUpperCase();
    }
    if (text === undefined) {
      text = node.findFirstExpression(Expressions.TypeTable)?.concatTokens().toUpperCase();
    }
    if (text === undefined) {
      text = node.findFirstExpression(Expressions.FormParamType)?.concatTokens().toUpperCase();
    }
    if (text === undefined) {
      text = "TYPE";
    }

    let found: AbstractType | undefined = undefined;
    if (text.startsWith("LIKE LINE OF ")) {
      const name = node.findFirstExpression(Expressions.FieldChain)?.concatTokens();
      const type = this.resolveLikeName(node.findFirstExpression(Expressions.Type), false);

      if (type === undefined) {
        return new Types.UnknownType("Type error, could not resolve \"" + name + "\", parseType");
      } else if (type instanceof Types.TableType) {
        return type.getRowType();
      } else if (type instanceof Types.VoidType) {
        return type;
      } else {
        return new Types.UnknownType("Type error, not a table type " + name);
      }
    } else if (text.startsWith("LIKE REF TO ")) {
      const name = node.findFirstExpression(Expressions.FieldChain)?.concatTokens();
      const type = this.resolveLikeName(node.findFirstExpression(Expressions.Type), false);
      if (type === undefined) {
        return new Types.UnknownType("Type error, could not resolve \"" + name + "\", parseType");
      }
      return new Types.DataReference(type);
    } else if (text.startsWith("TYPE TABLE OF REF TO ")
        || text.startsWith("TYPE STANDARD TABLE OF REF TO ")
        || text.startsWith("TYPE SORTED TABLE OF REF TO ")
        || text.startsWith("TYPE HASHED TABLE OF REF TO ")) {
      found = this.resolveTypeRef(typename);
      if (found) {
        return new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"), name);
      }
    } else if (text.startsWith("TYPE TABLE OF ")
        || text.startsWith("TYPE STANDARD TABLE OF ")
        || text.startsWith("TYPE SORTED TABLE OF ")
        || text.startsWith("TYPE HASHED TABLE OF ")) {
      found = this.resolveTypeName(typename);
      if (found) {
        return new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"), name);
      }
    } else if (text.startsWith("LIKE TABLE OF ")
        || text.startsWith("LIKE STANDARD TABLE OF ")
        || text.startsWith("LIKE SORTED TABLE OF ")
        || text.startsWith("LIKE HASHED TABLE OF ")) {
      found = this.resolveLikeName(node);
      if (found) {
        return new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"), name);
      }
    } else if (text === "TYPE STANDARD TABLE"
        || text === "TYPE SORTED TABLE"
        || text === "TYPE HASHED TABLE"
        || text === "TYPE INDEX TABLE"
        || text === "TYPE ANY TABLE") {
      return new Types.TableType(new Types.AnyType(), node.concatTokens().toUpperCase().includes("WITH HEADER LINE"));
    } else if (text.startsWith("TYPE RANGE OF ")) {
      const sub = node.findFirstExpression(Expressions.TypeName);
      found = this.resolveTypeName(sub);
      if (found === undefined) {
        return new Types.UnknownType("TYPE RANGE OF, could not resolve type");
      }
      const structure = new Types.StructureType([
        {name: "sign", type: new Types.CharacterType(1)},
        {name: "option", type: new Types.CharacterType(2)},
        {name: "low", type: found},
        {name: "high", type: found},
      ], name);
      return new Types.TableType(structure, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"));
    } else if (text.startsWith("LIKE ")) {
      let sub = node.findFirstExpression(Expressions.Type);
      if (sub === undefined) {
        sub = node.findFirstExpression(Expressions.FormParamType);
      }
      if (sub === undefined) {
        sub = node.findFirstExpression(Expressions.TypeParam);
      }
      found = this.resolveLikeName(sub);

      if (found && node.findDirectTokenByText("OCCURS")) {
        found = new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"), name);
      }
    } else if (text.startsWith("TYPE LINE OF ")) {
      const sub = node.findFirstExpression(Expressions.TypeName);
      found = this.resolveTypeName(sub);
      if (found instanceof TypedIdentifier) {
        found = found.getType();
      }
      if (found instanceof Types.TableType) {
        return found.getRowType();
      } else if (found instanceof Types.VoidType) {
        return found;
      } else if (found instanceof Types.UnknownType) {
        return new Types.UnknownType("TYPE LINE OF, unknown type, " + found.getError());
      } else {
        return new Types.UnknownType("TYPE LINE OF, unexpected type, " + found?.constructor.name);
      }
    } else if (text.startsWith("TYPE REF TO ")) {
      found = this.resolveTypeRef(typename);
    } else if (text.startsWith("TYPE")) {
      found = this.resolveTypeName(typename, this.findLength(node));

      const concat = node.concatTokens().toUpperCase();
      if (found && concat.includes(" OCCURS ")) {
        found = new Types.TableType(found, concat.includes("WITH HEADER LINE"), name);
      } else if (found && concat.includes("WITH HEADER LINE")) {
        if (found instanceof Types.VoidType) {
          found = new Types.TableType(found, true);
        } else if (!(found instanceof Types.TableType)) {
          throw new Error("WITH HEADER LINE can only be used with internal table");
        } else {
          found = new Types.TableType(found.getRowType(), true);
        }
      }

      if (found === undefined && typename === undefined) {
        let length = 1;

        const len = node.findDirectExpression(Expressions.ConstantFieldLength);
        if (len) {
          const int = len.findDirectExpression(Expressions.Integer);
          if (int) {
            length = parseInt(int.concatTokens(), 10);
          }
        }

        found = new Types.CharacterType(length, name); // fallback
        if (node.findDirectTokenByText("OCCURS")) {
          found = new Types.TableType(found, concat.includes("WITH HEADER LINE"), name);
        }
      }

    }

    return found;
  }

/////////////////////

  // todo, rewrite this method
  private resolveTypeChain(expr: ExpressionNode): AbstractType | undefined {
    const chainText = expr.concatTokens().toUpperCase();

    if (chainText.includes("=>") === false && chainText.includes("-") === false) {
      return undefined;
    }

    let className: string | undefined;
    let rest = chainText;
    if (chainText.includes("=>")) {
      const split = chainText.split("=>");
      className = split[0];
      rest = split[1];
    }
    const subs = rest.split("-");
    let foundType: AbstractType | undefined = undefined;


    if (className) {
      const split = chainText.split("=>");
      const className = split[0];

    // the prefix might be itself
      if ((this.scope.getType() === ScopeType.Interface
          || this.scope.getType() === ScopeType.ClassDefinition)
          && this.scope.getName().toUpperCase() === className.toUpperCase()) {
        const foundId = this.scope.findType(subs[0]);
        foundType = foundId?.getType();
        if (foundType === undefined) {
          return new Types.UnknownType("Could not resolve type " + chainText);
        }
        this.scope.addReference(expr.getTokens()[2], foundId, ReferenceType.TypeReference, this.filename);

      } else {
    // lookup in local and global scope
        const obj = this.scope.findObjectDefinition(className);
        if (obj === undefined && this.scope.getDDIC().inErrorNamespace(className) === false) {
          return new Types.VoidType(className);
        } else if (obj === undefined) {
          return new Types.UnknownType("Could not resolve top " + className + ", resolveTypeChain");
        }
        const type = obj instanceof ClassDefinition ? "CLAS" : "INTF";

        this.scope.addReference(expr.getFirstToken(), obj, ReferenceType.ObjectOrientedReference, this.filename,
                                {ooType: type, ooName: className});

        const byName = new ObjectOriented(this.scope).searchTypeName(obj, subs[0]);
        foundType = byName?.getType();
        if (byName === undefined || foundType === undefined) {
          return new Types.UnknownType(subs[0] + " not found in class or interface");
        }
        this.scope.addReference(expr.getTokens()[2], byName, ReferenceType.TypeReference, this.filename);

      }
    } else {
      const found = this.scope.findType(subs[0]);
      foundType = found?.getType();
      if (foundType === undefined) {
        const f = this.scope.getDDIC().lookupTableOrView(subs[0]);
        if (f instanceof TypedIdentifier) {
          foundType = f.getType();
        } else {
          foundType = f;
        }
      } else {
        this.scope.addReference(expr.getFirstToken(), found, ReferenceType.TypeReference, this.filename);
      }
      if (foundType === undefined && this.scope.getDDIC().inErrorNamespace(subs[0]) === false) {
        this.scope.addReference(expr.getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
        return new Types.VoidType(subs[0]);
      } else if (foundType instanceof Types.VoidType) {
        this.scope.addReference(expr.getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
        return foundType;
      } else if (foundType === undefined) {
        return new Types.UnknownType("Unknown type " + subs[0]);
      }
    }

    subs.shift();
    while (subs.length > 0) {
      if (foundType instanceof Types.UnknownType) {
        return foundType;
      } else if (!(foundType instanceof Types.StructureType)) {
        return new Types.UnknownType("Not a structured type");
      }
      foundType = foundType.getComponentByName(subs[0]);
      subs.shift();
    }

    return foundType;
  }

  private resolveConstantValue(expr: ExpressionNode): string | undefined {
    if (!(expr.get() instanceof Expressions.SimpleFieldChain)) {
      throw new Error("resolveConstantValue");
    }

    const first = expr.getFirstChild()!;
    if (first.get() instanceof Expressions.Field) {
      const token = first.getFirstToken();
      const name = token.getStr();
      const found = this.scope.findVariable(name);
      const val = found?.getValue();
      if (typeof val === "string") {
        this.scope.addReference(token, found, ReferenceType.DataReadReference, this.filename);
        return val;
      }
      return undefined;
    } else if (first.get() instanceof Expressions.ClassName) {
      const name = first.getFirstToken().getStr();
      const obj = this.scope.findObjectDefinition(name);
      if (obj === undefined) {
        throw new Error("resolveConstantValue, not found: " + name);
      }
      const children = expr.getChildren();

      const token = children[2]?.getFirstToken();
      const attr = token.getStr();
      const c = new ObjectOriented(this.scope).searchConstantName(obj, attr);
      if (c instanceof ClassConstant) {
        this.scope.addReference(token, c, ReferenceType.DataReadReference, this.filename);
        const val = c.getValue();
        if (typeof val === "string") {
          return val;
        } else if (typeof val === "object" && children[4]) {
          const name = children[4].getFirstToken().getStr();
          if (val[name] !== undefined) {
            return val[name];
          }
        }
        return undefined;
      }
      throw new Error("resolveConstantValue, constant not found " + attr);

    } else {
      throw new Error("resolveConstantValue, unexpected structure");
    }
  }

  private resolveTypeRef(chain: ExpressionNode | undefined): AbstractType | undefined {
    if (chain === undefined) {
      return undefined;
    }

    const name = chain.getFirstToken().getStr();
    if (chain.getAllTokens().length === 1) {
      if (name.toUpperCase() === "OBJECT") {
        return new Types.GenericObjectReferenceType();
      }
      const search = this.scope.existsObject(name);
      if (search.found === true && search.id) {
        this.scope.addReference(chain.getFirstToken(), search.id, ReferenceType.ObjectOrientedReference, this.filename,
                                {ooType: search.ooType, ooName: name});
        return new Types.ObjectReferenceType(search.id);
      }
    }

    const found = this.resolveTypeName(chain);
    if (found && !(found instanceof Types.UnknownType) && !(found instanceof Types.VoidType)) {
      return new Types.DataReference(found);
    } else if (chain.concatTokens().toUpperCase() === "DATA") {
      return new Types.DataReference(new Types.AnyType());
    }

    if (this.scope.isBadiDef(name) === true) {
      return new Types.VoidType(name);
    }

    if (this.scope.getDDIC()?.inErrorNamespace(name) === false) {
//      this.scope.addReference(chain.getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
      return new Types.VoidType(name);
    }

    return new Types.UnknownType("REF, unable to resolve " + name);
  }

  public findValue(node: StatementNode): string | undefined {
    const val = node.findFirstExpression(Expressions.Value);
    if (val === undefined) {
      throw new Error("set VALUE");
    }

    if (val.concatTokens().toUpperCase() === "VALUE IS INITIAL") {
      return "";
    }

    const constant = val.findFirstExpression(Expressions.Constant);
    if (constant) {
      return constant.concatTokens();
    }

    const chain = val.findFirstExpression(Expressions.SimpleFieldChain);
    if (chain) {
      return this.resolveConstantValue(chain);
    }

    throw new Error("findValue, unexpected");
  }

  private findLength(node: StatementNode | ExpressionNode): number | undefined {
    const val = node.findFirstExpression(Expressions.Length);
    const flen = node.findFirstExpression(Expressions.ConstantFieldLength);

    if (val && flen) {
      throw new Error("Only specify length once");
    }

    if (flen) {
      const cintExpr = flen.findFirstExpression(Expressions.Integer);
      if (cintExpr) {
        return this.parseInt(cintExpr.concatTokens());
      }

      const cchain = flen.findFirstExpression(Expressions.SimpleFieldChain);
      if (cchain) {
        return this.parseInt(this.resolveConstantValue(cchain));
      }
    }

    if (val === undefined) {
      return 1;
    }

    const intExpr = val.findFirstExpression(Expressions.Integer);
    if (intExpr) {
      return this.parseInt(intExpr.concatTokens());
    }

    const strExpr = val.findFirstExpression(Expressions.ConstantString);
    if (strExpr) {
      return this.parseInt(strExpr.concatTokens());
    }

    const chain = val.findFirstExpression(Expressions.SimpleFieldChain);
    if (chain) {
      return this.parseInt(this.resolveConstantValue(chain));
    }

    throw new Error("Unexpected, findLength");
  }

  private parseInt(text: string | undefined): number | undefined {
    if (text === undefined) {
      return undefined;
    }

    if (text.startsWith("'")) {
      text = text.split("'")[1];
    } else if (text.startsWith("`")) {
      text = text.split("`")[1];
    }

    return parseInt(text, 10);
  }

}