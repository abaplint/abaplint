/* eslint-disable default-case */
import {TypedIdentifier} from "../types/_typed_identifier";
import {StatementNode, ExpressionNode} from "../nodes";
import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Types from "../types/basic";
import {CurrentScope} from "./_current_scope";
import {AbstractType} from "../types/basic/_abstract_type";
import {ScopeType} from "./_scope_type";
import {ObjectOriented} from "./_object_oriented";
import {ClassConstant} from "../types/class_constant";
import {Identifier as TokenIdentifier} from "../1_lexer/tokens/identifier";
import {ReferenceType} from "./_reference";
import {CharacterType, ObjectReferenceType, StructureType, TableAccessType, TableType, VoidType} from "../types/basic";
import {FieldChain} from "./expressions/field_chain";
import {ClassDefinition, InterfaceDefinition} from "../types";
import {FieldSub, TypeTableKey} from "../2_statements/expressions";
import {BuiltIn} from "./_builtin";
import {Position} from "../../position";

export class BasicTypes {
  private readonly filename: string;
  private readonly scope: CurrentScope;

  public constructor(filename: string, scope: CurrentScope) {
    this.filename = filename;
    this.scope = scope;
  }

  public lookupQualifiedName(name: string | undefined): TypedIdentifier | undefined {
// argh, todo, rewrite this entire method, more argh
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
        if (typeName.includes("-")) {
          const split = typeName.split("-");
          const subTypeName = split[0];
          const fieldName = split[1];
          const stru = oo.getTypeDefinitions().getByName(subTypeName);
          const struType = stru?.getType();
          if (stru && struType instanceof StructureType) {
            const f = struType.getComponentByName(fieldName);
            if (f) {
              return new TypedIdentifier(stru.getToken(), stru.getFilename(), f);
            }
          }
        } else {
          const f = oo.getTypeDefinitions().getByName(typeName);
          if (f) {
            return f;
          }
        }
      }
    } else if (name.includes("-")) {
      const split = name.split("-");
      const typeName = split[0];
      const fieldName = split[1];
      const type = this.scope.findType(typeName);
      if (type) {
        const stru = type.getType();
        if (stru instanceof StructureType) {
          const f = stru.getComponentByName(fieldName);
          if (f) {
            return new TypedIdentifier(type.getToken(), type.getFilename(), f);
          }
        }
      }
    }

    const lookup = this.scope.getDDIC().lookupNoVoid(name);
    const id = lookup?.object?.getIdentifier();
    if (id && lookup?.type) {
      return new TypedIdentifier(id.getToken(), id.getFilename(), lookup.type);
    }

    const builtin = this.scope.getDDIC().lookupBuiltinType(name);
    if (builtin) {
      return new TypedIdentifier(new TokenIdentifier(new Position(1, 1), name), BuiltIn.filename, builtin);
    }

    const type = this.scope.findTypePoolType(name);
    if (type) {
      return type;
    }

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
    if (chain === undefined) {
      chain = node.findFirstExpression(Expressions.FieldSub);
    }
    if (chain === undefined) {
      chain = node.findFirstExpression(Expressions.SimpleFieldChain);
    }
    if (chain === undefined) {
      throw new Error("resolveLikeName, chain undefined");
    }
    const fullName = chain.concatTokens();
    const children = [...chain.getChildren()];

    if (children.length === 0) {
      return new Types.UnknownType("Type error, could not resolve \"" + fullName + "\", resolveLikeName1");
    }

    let type: AbstractType | undefined = undefined;
    if (children[1] && ( children[1].getFirstToken().getStr() === "=>" || children[1].getFirstToken().getStr() === "->")) {
      type = new FieldChain().runSyntax(chain, this.scope, this.filename, ReferenceType.TypeReference);
    } else {
      const name = children.shift()!.getFirstToken().getStr();
      let found = this.scope.findVariable(name);
      type = found?.getType();

      if (found === undefined) {
        found = this.scope.findExtraLikeType(name);
        type = found?.getType();
      }

      if (found) {
        this.scope.addReference(chain?.getFirstToken(), found, ReferenceType.TypeReference, this.filename);
      }

      if (type === undefined) {
        type = this.scope.getDDIC().lookupNoVoid(name)?.type;
      }

      if (type === undefined && this.scope.isOO() === false && this.scope.getDDIC().inErrorNamespace(name) === false) {
        this.scope.addReference(chain.getChildren()[0].getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
        return new Types.VoidType(name);
      }

      while (children.length > 0) {
        const child = children.shift()!;

        if (child.getFirstToken().getStr() === "-") {
          if (type instanceof Types.VoidType) {
            return type;
          }
        } else if (child.concatTokens() === "[]") {
          if (type instanceof Types.TableType) {
            type = new TableType(type.getRowType(), {withHeader: false});
          }
        } else { // field name
          let sub: AbstractType | undefined = undefined;
          if (type instanceof Types.TableType) {
            type = type.getRowType();
          }
          if (type instanceof Types.StructureType) {
            sub = type.getComponentByName(child.getFirstToken().getStr());
          }
          if (sub === undefined) {
            return new Types.UnknownType("Type error, field not part of structure " + fullName);
          }
          type = sub;
        }
      }

      if (type instanceof Types.VoidType) {
        return type;
      } else if (type instanceof TableType
          && type.isWithHeader()
          && headerLogic === true) {
        type = type.getRowType();
      } else if (type instanceof Types.TableType
          && type.isWithHeader() === true
          && type.getRowType() instanceof Types.VoidType) {
        return type.getRowType();
      }
    }

    if (!type) {
      return new Types.UnknownType("Type error, could not resolve \"" + fullName + "\", resolveLikeName2");
    }

    return type;
  }

  public resolveTypeName(typeName: ExpressionNode | undefined,
                         length?: number, decimals?: number, qualifiedName?: string): AbstractType | undefined {

    if (typeName === undefined) {
      return undefined;
    }

    let chain = this.resolveTypeChain(typeName);
    if (chain) {
      if (chain instanceof CharacterType && qualifiedName) {
        chain = chain.cloneType(qualifiedName);
      }
      return chain;
    }

    const chainText = typeName.concatTokens().toUpperCase();
    const f = this.scope.getDDIC().lookupBuiltinType(chainText, length, decimals, qualifiedName);
    if (f !== undefined) {
      return f;
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

    const type = this.scope.findTypePoolType(chainText)?.getType();
    if (type) {
//      this.scope.addReference(typeName.getFirstToken(), type, ReferenceType.TypeReference, this.filename);
      return type;
    }

    const ddic = this.scope.getDDIC().lookup(chainText);
    if (ddic) {
      this.scope.getDDICReferences().addUsing(this.scope.getParentObj(),
                                              {object: ddic.object, token: typeName.getFirstToken(), filename: this.filename});
      if (ddic.type instanceof TypedIdentifier) {
        this.scope.addReference(typeName.getFirstToken(), ddic.type, ReferenceType.TypeReference, this.filename);
      } else if (ddic.type instanceof VoidType) {
        this.scope.addReference(typeName.getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
      }
      return ddic.type;
    }

    return undefined;
  }

  public simpleType(node: StatementNode | ExpressionNode, qualifiedNamePrefix?: string): TypedIdentifier | undefined {
    let nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      nameExpr = node.findFirstExpression(Expressions.DefinitionName);
    }
    if (nameExpr === undefined) {
      return undefined;
    }
    let name = nameExpr.getFirstToken();
    if (nameExpr.countTokens() > 1) { // workaround for names with dashes
      name = new TokenIdentifier(name.getStart(), nameExpr.concatTokens());
    }

    let qualifiedName: string | undefined = undefined;
    if (node.get() instanceof Statements.Type) {
      if (this.scope.isTypePool() === true) {
        qualifiedName = name.getStr();
      } else {
        qualifiedName = ( qualifiedNamePrefix || "" ) + name.getStr();
        if (this.scope.getType() === ScopeType.ClassDefinition
            || this.scope.getType() === ScopeType.Interface) {
          qualifiedName = this.scope.getName() + "=>" + qualifiedName;
        }
      }
    } else if (qualifiedNamePrefix) {
      qualifiedName = qualifiedNamePrefix + qualifiedName;
    }

    const found = this.parseType(node, qualifiedName);
    if (found) {
      return new TypedIdentifier(name, this.filename, found);
    }

    return undefined;
  }

  public parseTable(node: ExpressionNode | StatementNode, name?: string): AbstractType | undefined {
    const typename = node.findFirstExpression(Expressions.TypeName);

    const text = node.findFirstExpression(Expressions.TypeTable)?.concatTokens().toUpperCase();
    if (text === undefined) {
      return undefined;
    }

    let type: Types.TableAccessType | undefined = undefined;
    if (text.startsWith("TYPE STANDARD TABLE ") || text.startsWith("LIKE STANDARD TABLE ")) {
      type = TableAccessType.standard;
    } else if (text.startsWith("TYPE SORTED TABLE ") || text.startsWith("LIKE SORTED TABLE ")) {
      type = TableAccessType.sorted;
    } else if (text.startsWith("TYPE HASHED TABLE ") || text.startsWith("LIKE HASHED TABLE ")) {
      type = TableAccessType.hashed;
    }

    const primaryKeyFields: string[] = [];
    const keys = node.findFirstExpression(TypeTableKey);
    for (const k of keys?.findDirectExpressions(FieldSub) || []) {
      primaryKeyFields.push(k.concatTokens().toUpperCase());
    }

    const options: Types.ITableOptions = {
      withHeader: text.includes(" WITH HEADER LINE"),
      primaryKey: {
        type: type,
        isUnique: text.includes(" WITH UNIQUE"),
        keyFields: primaryKeyFields,
      },
    };

    let found: AbstractType | undefined = undefined;
    if (text.startsWith("TYPE TABLE OF REF TO ")
        || text.startsWith("TYPE STANDARD TABLE OF REF TO ")
        || text.startsWith("TYPE SORTED TABLE OF REF TO ")
        || text.startsWith("TYPE HASHED TABLE OF REF TO ")) {
      found = this.resolveTypeRef(typename);
      if (found) {
        return new Types.TableType(found, options, name);
      }
    } else if (text.startsWith("TYPE TABLE OF ")
        || text.startsWith("TYPE STANDARD TABLE OF ")
        || text.startsWith("TYPE SORTED TABLE OF ")
        || text.startsWith("TYPE HASHED TABLE OF ")) {
      found = this.resolveTypeName(typename);
      if (found) {
        return new Types.TableType(found, options, name);
      }
    } else if (text.startsWith("LIKE TABLE OF ")
        || text.startsWith("LIKE STANDARD TABLE OF ")
        || text.startsWith("LIKE SORTED TABLE OF ")
        || text.startsWith("LIKE HASHED TABLE OF ")) {
      found = this.resolveLikeName(node);
      if (found) {
        return new Types.TableType(found, options, name);
      }
    } else if (text === "TYPE STANDARD TABLE"
        || text === "TYPE SORTED TABLE"
        || text === "TYPE HASHED TABLE"
        || text === "TYPE INDEX TABLE"
        || text === "TYPE ANY TABLE") {
      return new Types.TableType(new Types.AnyType(), options);
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
      return new Types.TableType(structure, options, name);
    } else if (text.startsWith("LIKE RANGE OF ")) {
      const sub = node.findFirstExpression(Expressions.SimpleFieldChain);
      found = this.resolveLikeName(sub);
      if (found === undefined) {
        return new Types.UnknownType("LIKE RANGE OF, could not resolve type");
      }
      const structure = new Types.StructureType([
        {name: "sign", type: new Types.CharacterType(1)},
        {name: "option", type: new Types.CharacterType(2)},
        {name: "low", type: found},
        {name: "high", type: found},
      ], name);
      return new Types.TableType(structure, options);

    } else if (typename && (text.startsWith("TYPE TABLE FOR CREATE ")
        || text.startsWith("TYPE TABLE FOR UPDATE "))) {
      const name = typename.concatTokens();
      const type = this.scope.getDDIC().lookupDDLS(name)?.type;
      if (type) {
        return new Types.TableType(new VoidType("RapTodo"), options);
      } else if (this.scope.getDDIC().inErrorNamespace(name)) {
        return new Types.UnknownType(`DDLS ${name} not found`);
      } else {
        return new Types.VoidType(name);
      }
    }

    // fallback to old style syntax, OCCURS etc
    return this.parseType(node, name);
  }

  public parseType(node: ExpressionNode | StatementNode, qualifiedName?: string): AbstractType | undefined {
    const typeName = node.findFirstExpression(Expressions.TypeName);

    let text = node.findFirstExpression(Expressions.Type)?.concatTokens().toUpperCase();
    if (text === undefined) {
      text = node.findFirstExpression(Expressions.TypeParam)?.concatTokens().toUpperCase();
    }
    if (text === undefined) {
      text = node.findFirstExpression(Expressions.TypeTable)?.concatTokens().toUpperCase();
      if (text?.startsWith("TYPE") === false && text?.startsWith("LIKE") === false) {
        text = "TYPE";
      }
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

      let e = node.findFirstExpression(Expressions.Type);
      if (e === undefined) {
        e = node.findFirstExpression(Expressions.FormParamType);
      }
      if (e === undefined) {
        e = node.findFirstExpression(Expressions.FieldChain);
      }

      const type = this.resolveLikeName(e, false);

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
      return new Types.DataReference(type, name);
    } else if (text === "TYPE STANDARD TABLE"
        || text === "TYPE SORTED TABLE"
        || text === "TYPE HASHED TABLE"
        || text === "TYPE INDEX TABLE"
        || text === "TYPE ANY TABLE") {
      return new Types.TableType(new Types.AnyType(), {withHeader: node.concatTokens().toUpperCase().includes("WITH HEADER LINE")});
    } else if (text.startsWith("LIKE ")) {
      let sub = node.findFirstExpression(Expressions.Type);
      if (sub === undefined) {
        sub = node.findFirstExpression(Expressions.FormParamType);
      }
      if (sub === undefined) {
        sub = node.findFirstExpression(Expressions.TypeParam);
      }
      if (sub === undefined) {
        sub = node.findFirstExpression(Expressions.FieldChain);
      }
      found = this.resolveLikeName(sub);

      if (found && this.isOccurs(node)) {
        found = new Types.TableType(found, {withHeader: text.includes("WITH HEADER LINE")}, qualifiedName);
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
      found = this.resolveTypeRef(typeName);
    } else if (text.startsWith("TYPE")) {
      found = this.resolveTypeName(typeName, this.findLength(node), this.findDecimals(node), qualifiedName);

      const concat = node.concatTokens().toUpperCase();
      if (found && this.isOccurs(node)) {
        found = new Types.TableType(found, {withHeader: concat.includes(" WITH HEADER LINE")}, qualifiedName);
      } else if (found && concat.includes(" WITH HEADER LINE")) {
        if (found instanceof Types.VoidType) {
          found = new Types.TableType(found, {withHeader: true});
        } else if (!(found instanceof Types.TableType)) {
          throw new Error("WITH HEADER LINE can only be used with internal table");
        } else {
          found = new Types.TableType(found.getRowType(), {withHeader: true});
        }
      }

      if (found === undefined && typeName === undefined) {
        let length = 1;

        const len = node.findDirectExpression(Expressions.ConstantFieldLength);
        if (len) {
          const int = len.findDirectExpression(Expressions.Integer);
          if (int) {
            length = parseInt(int.concatTokens(), 10);
          }
        }

        found = new Types.CharacterType(length, qualifiedName); // fallback
        if (this.isOccurs(node)) {
          found = new Types.TableType(found, {withHeader: concat.includes(" WITH HEADER LINE")}, qualifiedName);
        }
      }

    }

    return found;
  }

/////////////////////

  private isOccurs(node: ExpressionNode | StatementNode): boolean {
    if (node.findDirectTokenByText("OCCURS")) {
      return true;
    } else if (node.findFirstExpression(Expressions.TypeTable)?.findDirectTokenByText("OCCURS")) {
      return true;
    }
    return false;
  }

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
    } else if (chainText.includes("->")) {
      const split = chainText.split("->");
      className = split[0];
      rest = split[1];
    }
    const subs = rest.split("-");
    let foundType: AbstractType | undefined = undefined;

    if (className && chainText.includes("=>")) {
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
          this.scope.addReference(expr.getFirstToken(), undefined,
                                  ReferenceType.ObjectOrientedVoidReference, this.filename, {ooName: className.toUpperCase()});
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
    } else if (className && chainText.includes("->")) {
      const varVar = this.scope.findVariable(className);
      const foo = varVar?.getType();
      if (foo instanceof ObjectReferenceType) {
        const typeName = subs[0];
        let id = foo.getIdentifier();

        if (!(id instanceof ClassDefinition || id instanceof InterfaceDefinition)) {
          const found = this.scope.findObjectDefinition(foo.getIdentifierName());
          if (found) {
            id = found;
          } else {
            return new Types.UnknownType(foo.getIdentifierName() + " not found in scope");
          }
        }

        if (id instanceof ClassDefinition || id instanceof InterfaceDefinition) {
          const type = id instanceof ClassDefinition ? "CLAS" : "INTF";
          this.scope.addReference(expr.getFirstToken(), id, ReferenceType.ObjectOrientedReference, this.filename,
                                  {ooType: type, ooName: id.getName()});
          const byName = new ObjectOriented(this.scope).searchTypeName(id, typeName);
          foundType = byName?.getType();
          if (byName === undefined || foundType === undefined) {
            return new Types.UnknownType(typeName + " not found in class or interface");
          }
          this.scope.addReference(expr.getTokens()[2], byName, ReferenceType.TypeReference, this.filename);
        } else {
          return new Types.UnknownType("Not an object reference, " + className + ", " + id.constructor.name);
        }
      } else if (foo === undefined) {
        return new Types.UnknownType(className + " not found in scope");
      } else {
        return new Types.UnknownType("Not an object reference, " + className + ", " + foo.constructor.name);
      }
    } else {
      const found = this.scope.findType(subs[0]);
      foundType = found?.getType();
      if (foundType === undefined) {
        const typePoolType = this.scope.findTypePoolType(subs[0])?.getType();
        if (typePoolType) {
//          this.scope.addReference(typeName.getFirstToken(), typePoolType, ReferenceType.TypeReference, this.filename);
          foundType = typePoolType;
        }

        if (foundType === undefined) {
          const f = this.scope.getDDIC().lookupTableOrView(subs[0]);
          this.scope.getDDICReferences().addUsing(this.scope.getParentObj(),
                                                  {object: f.object, filename: this.filename, token: expr.getFirstToken()});
          if (f.type instanceof TypedIdentifier) {
            foundType = f.type.getType();
          } else {
            foundType = f.type;
          }
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
      if (foundType instanceof Types.UnknownType
          || foundType instanceof Types.VoidType) {
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

    const firstNode = expr.getFirstChild()!;
    const firstToken = firstNode.getFirstToken();
    const firstName = firstToken.getStr();
    if (firstNode.get() instanceof Expressions.Field) {
      const found = this.scope.findVariable(firstName);
      const val = found?.getValue();
      if (typeof val === "string") {
        this.scope.addReference(firstToken, found, ReferenceType.DataReadReference, this.filename);
        return val;
      }
      return undefined;
    } else if (firstNode.get() instanceof Expressions.ClassName
        && firstName.toLowerCase() === this.scope.getName().toLowerCase()
        && (this.scope.getType() === ScopeType.Interface
        || this.scope.getType() === ScopeType.ClassDefinition)) {
      const children = expr.getChildren();
      const token = children[2]?.getFirstToken();
      const found = this.scope.findVariable(token.getStr());
      const val = found?.getValue();
      if (typeof val === "string") {
        this.scope.addReference(firstToken, found, ReferenceType.DataReadReference, this.filename);
        return val;
      }
      return undefined;
    } else if (firstNode.get() instanceof Expressions.ClassName) {
      const obj = this.scope.findObjectDefinition(firstName);
      if (obj === undefined) {
        if (this.scope.existsObject(firstName).found === true) {
          return undefined;
        } else if (this.scope.getDDIC().inErrorNamespace(firstName) === true) {
          throw new Error("resolveConstantValue, not found: " + firstName);
        } else {
          this.scope.addReference(firstNode.getFirstToken(), undefined,
                                  ReferenceType.ObjectOrientedVoidReference, this.filename, {ooName: firstName.toUpperCase()});
          return undefined;
        }
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
        return new Types.ObjectReferenceType(search.id, name);
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
      throw new Error("VALUE missing in expression");
    }

    if (val.concatTokens().toUpperCase() === "VALUE IS INITIAL") {
      return undefined;
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

  private findDecimals(node: StatementNode | ExpressionNode): number | undefined {
    const dec = node.findDirectExpression(Expressions.Decimals)?.findDirectExpression(Expressions.Integer)?.concatTokens();
    if (dec) {
      return parseInt(dec, 10);
    }
    return undefined;
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
        const val = this.resolveConstantValue(cchain);
        return this.parseInt(val);
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
      const val = this.resolveConstantValue(chain);
      return this.parseInt(val);
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