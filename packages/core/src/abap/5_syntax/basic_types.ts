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
import {TableType} from "../types/basic";

export class BasicTypes {
  private readonly filename: string;
  private readonly scope: CurrentScope;

  public constructor(filename: string, scope: CurrentScope) {
    this.filename = filename;
    this.scope = scope;
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
    }

    let type: AbstractType | undefined = undefined;
    const name = children[0].getFirstToken().getStr();
    if (children[1] && children[1].getFirstToken().getStr() === "=>") {
      const obj = this.scope.findObjectDefinition(name);
      if (obj === undefined && this.scope.getDDIC().inErrorNamespace(name) === false) {
        return new Types.VoidType(name);
      } else if (obj === undefined) {
        return new Types.UnknownType("Could not resolve top " + name + ", resolveLikeName");
      }
      // todo, this does not respect visibility
      type = obj.getAttributes().findByName(children[2].getFirstToken().getStr())?.getType();

    } else if (children[1] && children[2] && children[1].getFirstToken().getStr() === "->") {
      type = this.scope.findVariable(name)?.getType();
      if (type instanceof Types.VoidType) {
        return type;
      } else if (!(type instanceof Types.ObjectReferenceType)) {
        return new Types.UnknownType("Type error, not a object reference " + name);
      }
      const def = this.scope.findObjectDefinition(type.getName());
      if (def === undefined && this.scope.getDDIC().inErrorNamespace(type.getName()) === false) {
        return new Types.VoidType(type.getName());
      } else if (def === undefined) {
        return new Types.UnknownType("Type error, could not find object definition");
      }
      const attr = def.getAttributes().findByName(children[2].getFirstToken().getStr());
      if (attr === undefined) {
        return new Types.UnknownType("Type error, not defined in object " + children[2]);
      }
      return attr.getType();
    } else {
      const found = this.scope.findVariable(name);
      type = found?.getType();

      if (found) {
        this.scope.addReference(chain?.getFirstToken(), found, ReferenceType.TypeReference, this.filename);
      }

      if (type instanceof TableType && node.getLastChild()?.get() instanceof Expressions.TableBody) {
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
          return new Types.UnknownType("Type error, not a structure type " + fullName);
        }
      }
    }

    if (!type) {
      return new Types.UnknownType("Type error, could not resolve \"" + fullName + "\", resolveLikeName2");
    }

    return type;
  }

  private resolveTypeName(typeName: ExpressionNode | undefined, length?: number): AbstractType | undefined {
    if (typeName === undefined) {
      return undefined;
    }

    const chain = this.resolveTypeChain(typeName);
    if (chain) {
      return chain;
    }

    const chainText = typeName.concatTokens().toUpperCase();
    if (chainText === "STRING") {
      return new Types.StringType();
    } else if (chainText === "XSTRING") {
      return new Types.XStringType();
    } else if (chainText === "D") {
      return new Types.DateType();
    } else if (chainText === "T") {
      return new Types.TimeType();
    } else if (chainText === "XSEQUENCE") {
      return new Types.XSequenceType();
    } else if (chainText === "CLIKE") {
      return new Types.CLikeType();
    } else if (chainText === "ANY") {
      return new Types.AnyType();
    } else if (chainText === "NUMERIC") {
      return new Types.NumericGenericType();
    } else if (chainText === "CSEQUENCE") {
      return new Types.CSequenceType();
    } else if (chainText === "I" || chainText === "INT8") {
      return new Types.IntegerType();
    } else if (chainText === "F") {
      return new Types.FloatType();
    } else if (chainText === "P") {
      return new Types.PackedType(1, 1); // todo, length and decimals
    } else if (chainText === "C") {
      if (length) {
        return new Types.CharacterType(length);
      } else {
        return new Types.CharacterType(1);
      }
    } else if (chainText === "X") {
      if (length) {
        return new Types.HexType(length);
      } else {
        return new Types.HexType(1);
      }
    } else if (chainText === "N") {
      if (length) {
        return new Types.NumericType(length);
      } else {
        return new Types.NumericType(1);
      }
    }

    const typ = this.scope.findType(chainText);
    if (typ) {
      this.scope.addReference(typeName.getFirstToken(), typ, ReferenceType.TypeReference, this.filename);
      return typ.getType();
    }

    const ddic = this.scope.getDDIC().lookup(chainText);
    if (ddic) {
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

  public parseType(node: ExpressionNode | StatementNode): AbstractType | undefined {
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
      return undefined; // todo
    } else if (text.startsWith("TYPE TABLE OF REF TO ")
        || text.startsWith("TYPE STANDARD TABLE OF REF TO ")
        || text.startsWith("TYPE SORTED TABLE OF REF TO ")
        || text.startsWith("TYPE HASHED TABLE OF REF TO ")) {
      found = this.resolveTypeRef(typename);
      if (found) {
        return new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"));
      }
    } else if (text.startsWith("TYPE TABLE OF ")
        || text.startsWith("TYPE STANDARD TABLE OF ")
        || text.startsWith("TYPE SORTED TABLE OF ")
        || text.startsWith("TYPE HASHED TABLE OF ")) {
      found = this.resolveTypeName(typename);
      if (found) {
        return new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"));
      }
    } else if (text.startsWith("LIKE TABLE OF ")
        || text.startsWith("LIKE STANDARD TABLE OF ")
        || text.startsWith("LIKE SORTED TABLE OF ")
        || text.startsWith("LIKE HASHED TABLE OF ")) {
      const sub = node.findFirstExpression(Expressions.TypeName);
      found = this.resolveLikeName(sub);
      if (found) {
        return new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"));
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
      ]);
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
        found = new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"));
      }
    } else if (text.startsWith("TYPE LINE OF ")) {
      const sub = node.findFirstExpression(Expressions.TypeName);
      found = this.resolveTypeName(sub);
      if (found instanceof Types.TableType) {
        return found.getRowType();
      } else if (found instanceof Types.VoidType) {
        return found;
      } else {
        return new Types.UnknownType("TYPE LINE OF, could not resolve type");
      }
    } else if (text.startsWith("TYPE REF TO ")) {
      found = this.resolveTypeRef(typename);
    } else if (text.startsWith("TYPE")) {
      found = this.resolveTypeName(typename, this.findLength(node));

      if (found === undefined && typename === undefined) {
        let length = 1;

        const len = node.findDirectExpression(Expressions.ConstantFieldLength);
        if (len) {
          const int = len.findDirectExpression(Expressions.Integer);
          if (int) {
            length = parseInt(int.concatTokens(), 10);
          }
        }

        found = new Types.CharacterType(length); // fallback
      }

      if (found && node.findDirectTokenByText("OCCURS")) {
        found = new Types.TableType(found, node.concatTokens().toUpperCase().includes("WITH HEADER LINE"));
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
        foundType = this.scope.findType(subs[0])?.getType();
        if (foundType === undefined) {
          return new Types.UnknownType("Could not resolve type " + chainText);
        }
      } else {
    // lookup in local and global scope
        const obj = this.scope.findObjectDefinition(className);
        if (obj === undefined && this.scope.getDDIC().inErrorNamespace(className) === false) {
          return new Types.VoidType(className);
        } else if (obj === undefined) {
          return new Types.UnknownType("Could not resolve top " + className + ", resolveTypeChain");
        }
        this.scope.addReference(expr.getFirstToken(), obj, ReferenceType.ObjectOrientedReference, this.filename);

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
        foundType = this.scope.getDDIC().lookupTableOrView(subs[0]);
      } else {
        this.scope.addReference(expr.getFirstToken(), found, ReferenceType.TypeReference, this.filename);
      }
      if (foundType === undefined && this.scope.getDDIC().inErrorNamespace(subs[0]) === false) {
        return new Types.VoidType(subs[0]);
      } else if (foundType instanceof Types.VoidType) {
        return foundType;
      } else if (foundType === undefined) {
        return new Types.UnknownType("Unknown type " + subs[0]);
      }
    }

    subs.shift();
    while (subs.length > 0) {
      if (!(foundType instanceof Types.StructureType)) {
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
      const name = first.getFirstToken().getStr();
      const found = this.scope.findVariable(name);
      return found?.getValue();
    } else if (first.get() instanceof Expressions.ClassName) {
      const name = first.getFirstToken().getStr();
      const obj = this.scope.findObjectDefinition(name);
      if (obj === undefined) {
        throw new Error("resolveConstantValue, not found: " + name);
      }
      const children = expr.getChildren();

      const attr = children[2]?.getFirstToken().getStr();
      const c = new ObjectOriented(this.scope).searchConstantName(obj, attr);
      if (c instanceof ClassConstant) {
        return c.getValue();
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
      const search = this.scope.existsObject(name);
      if (search.found === true) {
        this.scope.addReference(chain.getFirstToken(), search.id, ReferenceType.ObjectOrientedReference, this.filename);
        return new Types.ObjectReferenceType(name);
      }
    }

    const found = this.resolveTypeName(chain);
    if (found && !(found instanceof Types.UnknownType) && !(found instanceof Types.VoidType)) {
      return new Types.DataReference(found);
    } else if (chain.concatTokens().toUpperCase() === "DATA") {
      return new Types.DataReference(new Types.AnyType());
    }

    if (this.scope.getDDIC()?.inErrorNamespace(name) === false) {
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