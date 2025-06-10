import {TypedIdentifier} from "../types/_typed_identifier";
import {StatementNode, ExpressionNode} from "../nodes";
import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Types from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {ScopeType} from "./_scope_type";
import {ObjectOriented} from "./_object_oriented";
import {ClassConstant} from "../types/class_constant";
import {Identifier as TokenIdentifier} from "../1_lexer/tokens/identifier";
import {ReferenceType} from "./_reference";
import {CharacterType, ITableKey, ObjectReferenceType, StructureType, TableAccessType, TableType, VoidType} from "../types/basic";
import {FieldChain} from "./expressions/field_chain";
import {ClassDefinition, InterfaceDefinition} from "../types";
import {Field, FieldSub, TypeTableKey} from "../2_statements/expressions";
import {BuiltIn} from "./_builtin";
import {Position} from "../../position";
import {SyntaxInput} from "./_syntax_input";

export class BasicTypes {
  private readonly input: SyntaxInput;

  public constructor(input: SyntaxInput) {
    this.input = input;
  }

  public lookupQualifiedName(name: string | undefined): TypedIdentifier | undefined {
// argh, todo, rewrite this entire method, more argh, again argh
    if (name === undefined) {
      return undefined;
    }

    const found = this.input.scope.findType(name);
    if (found) {
      return found;
    }

    if (name.includes("=>")) {
      const split = name.split("=>");
      const ooName = split[0];
      const typeName = split[1];
      const oo = this.input.scope.findObjectDefinition(ooName);
      if (oo) {
        if (typeName.includes("-")) {
          const split = typeName.split("-");
          const subTypeName = split[0];
          const fieldName = split[1];
          const stru = oo.getTypeDefinitions().getByName(subTypeName);
          const struType = stru?.getType();
          if (stru && struType instanceof StructureType) {
            let f = struType.getComponentByName(fieldName);
            if (split[2] && f instanceof StructureType) {
              f = f.getComponentByName(split[2]);
            }
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
      const type = this.input.scope.findType(typeName);
      if (type) {
        const stru = type.getType();
        if (stru instanceof StructureType) {
          let f = stru.getComponentByName(fieldName);
          if (split[2] && f instanceof StructureType) {
            f = f.getComponentByName(split[2]);
          }
          if (f) {
            return new TypedIdentifier(type.getToken(), type.getFilename(), f);
          }
        }
      }
    }

    const lookup = this.input.scope.getDDIC().lookupNoVoid(name);
    const id = lookup?.object?.getIdentifier();
    if (id && lookup?.type) {
      return new TypedIdentifier(id.getToken(), id.getFilename(), lookup.type);
    }

    const builtin = this.input.scope.getDDIC().lookupBuiltinType(name);
    if (builtin) {
      return new TypedIdentifier(new TokenIdentifier(new Position(1, 1), name), BuiltIn.filename, builtin);
    }

    const type = this.input.scope.findTypePoolType(name);
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
    let children = [...chain.getChildren()];

    if (children.length === 0) {
      return new Types.UnknownType("Type error, could not resolve \"" + fullName + "\", resolveLikeName1");
    }

    let type: AbstractType | undefined = undefined;
    if (children[1] && ( children[1].getFirstToken().getStr() === "=>" || children[1].getFirstToken().getStr() === "->")) {
      type = FieldChain.runSyntax(chain, this.input, ReferenceType.TypeReference);
    } else {
      const name = children.shift()!.getFirstToken().getStr();
      let found = this.input.scope.findVariable(name);

      const full = this.input.scope.findVariable(fullName); // workaround for eg "sy-repid"
      if (full) {
        children = [];
        found = full;
      }

      type = found?.getType();

      if (found === undefined) {
        found = this.input.scope.findExtraLikeType(name);
        type = found?.getType();
      }

      if (found) {
        this.input.scope.addReference(chain?.getFirstToken(), found, ReferenceType.TypeReference, this.input.filename);
      }

      if (type === undefined) {
        type = this.input.scope.getDDIC().lookupNoVoid(name)?.type;
      }

      if (type === undefined && this.input.scope.isAnyOO() === false && this.input.scope.getDDIC().inErrorNamespace(name) === false) {
        this.input.scope.addReference(chain.getChildren()[0].getFirstToken(), undefined, ReferenceType.VoidType, this.input.filename);
        return Types.VoidType.get(name);
      }

      while (children.length > 0) {
        const child = children.shift()!;

        if (child.getFirstToken().getStr() === "-") {
          if (type instanceof Types.VoidType) {
            return type;
          }
        } else if (child.concatTokens() === "[]") {
          if (type instanceof Types.TableType) {
            type = new TableType(type.getRowType(), {withHeader: false, keyType: Types.TableKeyType.default});
          }
        } else { // field name
          if (type instanceof Types.TableType) {
            type = type.getRowType();
          }
          if (type instanceof Types.StructureType) {
            type = type.getComponentByName(child.getFirstToken().getStr());
            if (type === undefined) {
              return new Types.UnknownType("Type error, field not part of structure " + fullName);
            }
          } else if (!(type instanceof Types.VoidType)) {
            return new Types.UnknownType("Type error, field not part of structure " + fullName);
          }
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

  private cloneType(type: AbstractType, qualifiedName?: string): AbstractType {
    // nested types(containing "-") will inherit the qualified names if possible
    // todo, this needs to be extended to all AbstractTypes instead of just CharacterType
    if (type instanceof CharacterType
        && qualifiedName
        && qualifiedName.includes("-") === false) {
      type = type.cloneType({qualifiedName});
    }
    return type;
  }

  public resolveTypeName(typeName: ExpressionNode | undefined,
                         length?: number, decimals?: number, qualifiedName?: string): AbstractType | undefined {

    if (typeName === undefined) {
      return undefined;
    }

    const chain = this.resolveTypeChain(typeName);
    if (chain) {
      return this.cloneType(chain, qualifiedName);
    }

    const chainText = typeName.concatTokens().toUpperCase();
    const f = this.input.scope.getDDIC().lookupBuiltinType(chainText, length, decimals, qualifiedName);
    if (f !== undefined) {
      return f;
    }

    const typ = this.input.scope.findType(chainText);
    if (typ) {
      const token = typeName.getFirstToken();

      if (chainText.includes("~")) {
        const name = chainText.split("~")[0];
        const idef = this.input.scope.findInterfaceDefinition(name);
        if (idef) {
          this.input.scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, this.input.filename, {ooType: "INTF", ooName: name});
        }
      }

      this.input.scope.addReference(token, typ, ReferenceType.TypeReference, this.input.filename);
      return typ.getType();
    }

    const type = this.input.scope.findTypePoolType(chainText)?.getType();
    if (type) {
//      this.scope.addReference(typeName.getFirstToken(), type, ReferenceType.TypeReference, this.filename);
      return type;
    }

    const ddic = this.input.scope.getDDIC().lookup(chainText);
    if (ddic) {
      this.input.scope.getDDICReferences().addUsing(this.input.scope.getParentObj(),
                                                    {object: ddic.object, token: typeName.getFirstToken(), filename: this.input.filename});
      if (ddic.type instanceof TypedIdentifier) {
        this.input.scope.addReference(typeName.getFirstToken(), ddic.type, ReferenceType.TypeReference, this.input.filename);
      } else if (ddic.type instanceof VoidType) {
        this.input.scope.addReference(typeName.getFirstToken(), undefined, ReferenceType.VoidType, this.input.filename);
      }

      return this.cloneType(ddic.type, qualifiedName);
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
      if (this.input.scope.isTypePool() === true) {
        qualifiedName = name.getStr();
      } else {
        qualifiedName = ( qualifiedNamePrefix || "" ) + name.getStr();
        if (this.input.scope.getType() === ScopeType.ClassDefinition
            || this.input.scope.getType() === ScopeType.Interface) {
          qualifiedName = this.input.scope.getName() + "=>" + qualifiedName;
        }
      }
    } else if (qualifiedNamePrefix) {
      qualifiedName = qualifiedNamePrefix + qualifiedName;
    }

    const found = this.parseType(node, qualifiedName);
    if (found) {
      return new TypedIdentifier(name, this.input.filename, found);
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
    if (text.startsWith("TYPE STANDARD TABLE ")
        || text.startsWith("TYPE TABLE ")
        || text.startsWith("LIKE TABLE ")
        || text.startsWith("LIKE STANDARD TABLE ")) {
      type = TableAccessType.standard;
    } else if (text.startsWith("TYPE SORTED TABLE ")
        || text.startsWith("LIKE SORTED TABLE ")) {
      type = TableAccessType.sorted;
    } else if (text.startsWith("TYPE HASHED TABLE ")
        || text.startsWith("LIKE HASHED TABLE ")) {
      type = TableAccessType.hashed;
    }

    const typeTableKeys = node.findAllExpressions(TypeTableKey);

    const firstKey = typeTableKeys[0];
    const isNamed = firstKey?.findDirectExpression(Field) !== undefined
      && firstKey?.findDirectExpression(Field)?.concatTokens().toUpperCase() !== "PRIMARY_KEY";
    const primaryKey: ITableKey = {
      name: "primary_key",
      type: type || TableAccessType.standard,
      isUnique: isNamed ? false : firstKey?.concatTokens().toUpperCase().includes("WITH UNIQUE ") === true,
      keyFields: [],
    };
    let start = 1;
    if (isNamed === false) {
      for (const k of firstKey?.findDirectExpressions(FieldSub) || []) {
        primaryKey.keyFields.push(k.concatTokens().toUpperCase());
      }
    } else {
      start = 0;
    }

    const secondaryKeys: ITableKey[] = [];
    for (let i = start; i < typeTableKeys.length; i++) {
      const row = typeTableKeys[i];
      const name = row.findDirectExpression(Field)?.concatTokens();
      if (name === undefined) {
        continue;
      }

      const secondary: ITableKey = {
        name: name,
        type: row.findDirectTokenByText("SORTED") ? TableAccessType.sorted : TableAccessType.hashed,
        isUnique: row?.concatTokens().toUpperCase().includes("WITH UNIQUE ") === true,
        keyFields: [],
      };

      for (const k of row?.findDirectExpressions(FieldSub) || []) {
        secondary.keyFields.push(k.concatTokens().toUpperCase());
      }

      secondaryKeys.push(secondary);
    }

    let keyType = Types.TableKeyType.user;
    if (text.includes(" EMPTY KEY")) {
      keyType = Types.TableKeyType.empty;
    } else if (text.includes(" DEFAULT KEY")) {
      keyType = Types.TableKeyType.default;
    }

    const options: Types.ITableOptions = {
      withHeader: text.includes(" WITH HEADER LINE"),
      keyType: keyType,
      primaryKey: primaryKey,
      secondary: secondaryKeys,
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
      return new Types.TableType(Types.AnyType.get(), options);
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
      options.primaryKey!.type = TableAccessType.standard;
      return new Types.TableType(structure, options, name);
    } else if (text.startsWith("LIKE RANGE OF ")) {
      const sub = node.findFirstExpression(Expressions.FieldChain);
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
      options.primaryKey!.type = TableAccessType.standard;
      return new Types.TableType(structure, options);
    } else if (typename && (text.startsWith("TYPE TABLE FOR CREATE ")
        || text.startsWith("TYPE TABLE FOR UPDATE "))) {
      const name = typename.concatTokens();
      const type = this.input.scope.getDDIC().lookupDDLS(name)?.type;
      if (type) {
        return new Types.TableType(VoidType.get("RapTodo"), options);
      } else if (this.input.scope.getDDIC().inErrorNamespace(name)) {
        return new Types.UnknownType(`DDLS ${name} not found`);
      } else {
        return Types.VoidType.get(name);
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
    if (text === undefined
        && node.get() instanceof Statements.Parameter
        && node.findDirectTokenByText("LIKE")) {
      text = "LIKE " + typeName?.concatTokens();
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
      return new Types.TableType(Types.AnyType.get(), {withHeader: node.concatTokens().toUpperCase().includes("WITH HEADER LINE"), keyType: Types.TableKeyType.default});
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
      if (sub === undefined) {
        sub = node.findFirstExpression(Expressions.TypeName);
      }
      found = this.resolveLikeName(sub);

      if (found && this.isOccurs(node)) {
        found = new Types.TableType(found, {withHeader: text.includes("WITH HEADER LINE"), keyType: Types.TableKeyType.default}, qualifiedName);
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
        found = new Types.TableType(found, {withHeader: concat.includes(" WITH HEADER LINE"), keyType: Types.TableKeyType.default}, qualifiedName);
      } else if (found && concat.includes(" WITH HEADER LINE")) {
        if (found instanceof Types.VoidType) {
          found = new Types.TableType(found, {withHeader: true, keyType: Types.TableKeyType.default});
        } else if (!(found instanceof Types.TableType)) {
          throw new Error("WITH HEADER LINE can only be used with internal table");
        } else {
          found = new Types.TableType(found.getRowType(), {withHeader: true, keyType: Types.TableKeyType.default});
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

        found = new Types.CharacterType(length, {qualifiedName: qualifiedName}); // fallback
        if (this.isOccurs(node)) {
          found = new Types.TableType(found, {withHeader: concat.includes(" WITH HEADER LINE"), keyType: Types.TableKeyType.default}, qualifiedName);
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
    if (chainText.includes("-")) {
      // workaround for stuff like "sy-repid"
      const built = this.input.scope.findType(chainText);
      if (built) {
        this.input.scope.addReference(expr.getFirstToken(), built, ReferenceType.TypeReference, this.input.filename);
        return built.getType();
      }
    } else if (chainText.includes("=>") === false && chainText.includes("-") === false) {
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
      if ((this.input.scope.getType() === ScopeType.Interface
          || this.input.scope.getType() === ScopeType.ClassDefinition)
          && this.input.scope.getName().toUpperCase() === className.toUpperCase()) {
        const foundId = this.input.scope.findType(subs[0]);
        foundType = foundId?.getType();
        if (foundType === undefined) {
          return new Types.UnknownType("Could not resolve type " + chainText);
        }
        const token = expr.getChildren()[2]?.getFirstToken();
        if (token) {
          this.input.scope.addReference(token, foundId, ReferenceType.TypeReference, this.input.filename);
        }
      } else {
    // lookup in local and global scope
        const obj = this.input.scope.findObjectDefinition(className);
        if (obj === undefined && this.input.scope.getDDIC().inErrorNamespace(className) === false) {
          this.input.scope.addReference(
            expr.getFirstToken(), undefined,
            ReferenceType.ObjectOrientedVoidReference, this.input.filename, {ooName: className.toUpperCase()});
          return Types.VoidType.get(className);
        } else if (obj === undefined) {
          return new Types.UnknownType("Could not resolve top " + className + ", resolveTypeChain");
        }
        const type = obj instanceof ClassDefinition ? "CLAS" : "INTF";

        this.input.scope.addReference(
          expr.getFirstToken(), obj, ReferenceType.ObjectOrientedReference, this.input.filename,
          {ooType: type, ooName: className});

        const byName = new ObjectOriented(this.input.scope).searchTypeName(obj, subs[0]);
        foundType = byName?.getType();
        if (byName === undefined || foundType === undefined) {
          return new Types.UnknownType(subs[0] + " not found in class or interface");
        }

        const token = expr.getChildren()[2]?.getFirstToken();
        if (token) {
          this.input.scope.addReference(token, byName, ReferenceType.TypeReference, this.input.filename);
        }
      }
    } else if (className && chainText.includes("->")) {
      const varVar = this.input.scope.findVariable(className);
      const foo = varVar?.getType();
      if (foo instanceof ObjectReferenceType) {
        const typeName = subs[0];
        let id = foo.getIdentifier();

        if (!(id instanceof ClassDefinition || id instanceof InterfaceDefinition)) {
          const found = this.input.scope.findObjectDefinition(foo.getIdentifierName());
          if (found) {
            id = found;
          } else {
            return new Types.UnknownType(foo.getIdentifierName() + " not found in scope");
          }
        }

        if (id instanceof ClassDefinition || id instanceof InterfaceDefinition) {
          const type = id instanceof ClassDefinition ? "CLAS" : "INTF";
          this.input.scope.addReference(
            expr.getFirstToken(), id, ReferenceType.ObjectOrientedReference, this.input.filename,
            {ooType: type, ooName: id.getName()});
          const byName = new ObjectOriented(this.input.scope).searchTypeName(id, typeName);
          foundType = byName?.getType();
          if (byName === undefined || foundType === undefined) {
            return new Types.UnknownType(typeName + " not found in class or interface");
          }
          const token = expr.getChildren()[2]?.getFirstToken();
          if (token) {
            this.input.scope.addReference(token, byName, ReferenceType.TypeReference, this.input.filename);
          }
        } else {
          return new Types.UnknownType("Not an object reference, " + className + ", " + id.constructor.name);
        }
      } else if (foo === undefined) {
        return new Types.UnknownType(className + " not found in scope");
      } else {
        return new Types.UnknownType("Not an object reference, " + className + ", " + foo.constructor.name);
      }
    } else {
      const found = this.input.scope.findType(subs[0]);
      foundType = found?.getType();
      if (foundType === undefined) {
        const typePoolType = this.input.scope.findTypePoolType(subs[0])?.getType();
        if (typePoolType) {
//          this.scope.addReference(typeName.getFirstToken(), typePoolType, ReferenceType.TypeReference, this.filename);
          foundType = typePoolType;
        }

        if (foundType === undefined) {
          const f = this.input.scope.getDDIC().lookupTableOrView(subs[0]);
          this.input.scope.getDDICReferences().addUsing(
            this.input.scope.getParentObj(),
            {object: f.object, filename: this.input.filename, token: expr.getFirstToken()});
          if (f.type instanceof TypedIdentifier) {
            foundType = f.type.getType();
          } else {
            foundType = f.type;
          }
        }

      } else {
        this.input.scope.addReference(expr.getFirstToken(), found, ReferenceType.TypeReference, this.input.filename);
      }
      if (foundType === undefined && this.input.scope.getDDIC().inErrorNamespace(subs[0]) === false) {
        this.input.scope.addReference(expr.getFirstToken(), undefined, ReferenceType.VoidType, this.input.filename);
        return Types.VoidType.get(subs[0]);
      } else if (foundType instanceof Types.VoidType) {
        this.input.scope.addReference(expr.getFirstToken(), undefined, ReferenceType.VoidType, this.input.filename);
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
      if (foundType === undefined) {
        return new Types.UnknownType(`Field "${subs[0]}" not found in structure`);
      }
      subs.shift();
    }

    return foundType;
  }

  private resolveConstantValue(expr: ExpressionNode): string | undefined {
// todo: rewrite this method
    if (!(expr.get() instanceof Expressions.SimpleFieldChain)) {
      throw new Error("resolveConstantValue");
    }

    const firstNode = expr.getFirstChild()!;
    const firstToken = firstNode.getFirstToken();
    const firstName = firstToken.getStr();
    if (firstNode.get() instanceof Expressions.Field) {
      const found = this.input.scope.findVariable(firstName);
      const val = found?.getValue();
      if (typeof val === "string") {
        this.input.scope.addReference(firstToken, found, ReferenceType.DataReadReference, this.input.filename);
        return val;
      } else if (found?.getType() instanceof StructureType) {
        this.input.scope.addReference(firstToken, found, ReferenceType.DataReadReference, this.input.filename);
      }
      return undefined;
    } else if (firstNode.get() instanceof Expressions.ClassName
        && firstName.toLowerCase() === this.input.scope.getName().toLowerCase()
        && (this.input.scope.getType() === ScopeType.Interface
        || this.input.scope.getType() === ScopeType.ClassDefinition)) {
      const children = expr.getChildren();
      const token = children[2]?.getFirstToken();
      const found = this.input.scope.findVariable(token.getStr());
      const val = found?.getValue();
      if (typeof val === "string") {
        this.input.scope.addReference(firstToken, found, ReferenceType.DataReadReference, this.input.filename);
        return val;
      }
      return undefined;
    } else if (firstNode.get() instanceof Expressions.ClassName) {
      const obj = this.input.scope.findObjectDefinition(firstName);
      if (obj === undefined) {
        if (this.input.scope.existsObject(firstName) !== undefined) {
          return undefined;
        } else if (this.input.scope.getDDIC().inErrorNamespace(firstName) === true) {
          throw new Error("resolveConstantValue, not found: " + firstName);
        } else {
          this.input.scope.addReference(
            firstNode.getFirstToken(), undefined,
            ReferenceType.ObjectOrientedVoidReference, this.input.filename, {ooName: firstName.toUpperCase()});
          return undefined;
        }
      }
      const children = expr.getChildren();
      const token = children[2]?.getFirstToken();
      const attr = token.getStr();
      const c = new ObjectOriented(this.input.scope).searchConstantName(obj, attr);
      if (c instanceof ClassConstant) {
        this.input.scope.addReference(firstToken, obj, ReferenceType.ObjectOrientedReference, this.input.filename, {ooName: obj.getName()});
        this.input.scope.addReference(token, c, ReferenceType.DataReadReference, this.input.filename);
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
    if (chain.getChildren().length === 1) {
      if (name.toUpperCase() === "OBJECT") {
        return new Types.GenericObjectReferenceType();
      }
      const search = this.input.scope.existsObject(name);
      if (search?.id) {
        this.input.scope.addReference(
          chain.getFirstToken(), search.id, ReferenceType.ObjectOrientedReference, this.input.filename,
          {ooType: search.ooType, ooName: name});
        return new Types.ObjectReferenceType(search.id, {qualifiedName: name, RTTIName: search.RTTIName});
      }
    }

    const found = this.resolveTypeName(chain);
    if (found && !(found instanceof Types.UnknownType) && !(found instanceof Types.VoidType)) {
      return new Types.DataReference(found);
    } else if (chain.concatTokens().toUpperCase() === "DATA") {
      return new Types.DataReference(new Types.DataType());
    }

    if (this.input.scope.isBadiDef(name) === true) {
      return Types.VoidType.get(name);
    }

    if (this.input.scope.getDDIC()?.inErrorNamespace(name) === false) {
//      this.scope.addReference(chain.getFirstToken(), undefined, ReferenceType.VoidType, this.filename);
      return Types.VoidType.get(name);
    }

    return new Types.UnknownType("REF, unable to resolve " + name);
  }

  public findValue(node: StatementNode | ExpressionNode): string | undefined {
    const val = node.findFirstExpression(Expressions.Value);
    if (val === undefined) {
      throw new Error("VALUE missing in expression");
    }

    if (val.concatTokens().toUpperCase() === "VALUE IS INITIAL") {
      return undefined;
    }

    const constant = val.findFirstExpression(Expressions.Constant);
    if (constant) {
      const conc = val.findFirstExpression(Expressions.ConcatenatedConstant);
      if (conc) {
        const first = conc.getFirstToken().getStr().substring(0, 1);
        let result = "";
        for (const token of conc.getAllTokens()) {
          if (token.getStr() === "&") {
            continue;
          } else {
            result += token.getStr().substring(1, token.getStr().length - 1);
          }
        }
        return first + result + first;
      } else {
        return constant.concatTokens();
      }
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