import {TypedIdentifier} from "../types/_typed_identifier";
import {StatementNode, ExpressionNode, StructureNode} from "../nodes";
import {Identifier} from "../types/_identifier";
import * as Statements from "../statements";
import * as Expressions from "../expressions";
import * as Types from "../types/basic/";
import {Scope} from "./_scope";
import {AbstractType} from "../types/basic/_abstract_type";
import {TypedConstantIdentifier} from "../types/_typed_constant_identifier";
import {Chaining} from "./chaining";
import {IStructureComponent, StructureType} from "../types/basic/";

export class BasicTypes {
  private readonly filename: string;
  private readonly scope: Scope;

  public constructor(filename: string, scope: Scope) {
    this.filename = filename;
    this.scope = scope;
  }

  public buildStructureType(node: StructureNode): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    let components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      if (c instanceof StatementNode && c.get() instanceof Statements.Type) {
        const found = this.buildTypes(c);
        if (found === undefined) {
          return undefined;
        }

        components.push({
          name: found.getName(),
          type: found.getType(),
        });
      } else if (c instanceof StatementNode && c.get() instanceof Statements.IncludeType) {
        const iname = c.findFirstExpression(Expressions.TypeName)!.getFirstToken()!.getStr();
        const ityp = this.scope.resolveType(iname);
        if (ityp) {
          const typ = ityp.getType();
          if (typ instanceof StructureType) {
            components = components.concat(typ.getComponents());
          } // todo, else exception?
        } // todo, else exception?
      }
      // todo, nested structures
    }

    if (components.length === 0) { // todo, remove this check
      return undefined;
    }

    return new TypedIdentifier(name, this.filename, new Types.StructureType(components));
  }

  public buildTypes(node: StatementNode): TypedIdentifier | undefined {
    if (!(node.get() instanceof Statements.Type)) {
      return undefined;
    }

    const table = this.tableType(node);
    if (table) {
      return table;
    }

    const found = this.simpleType(node);
    if (found) {
      return found;
    }
/*
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      throw new Error("unresolved TYPE");
    } else {
      throw new Error("unresolved TYPE, \"" + nameExpr.getFirstToken().getStr() + "\"");
    }
*/
    return undefined;
  }

  public buildVariables(node: StatementNode): TypedIdentifier | Identifier | undefined {
    const sub = node.get();

    if (sub instanceof Statements.Data
        || sub instanceof Statements.Static) {
      const found = this.tableType(node);
      if (found) {
        return found;
      }
    }

    if (sub instanceof Statements.Data
        || sub instanceof Statements.Constant
        || sub instanceof Statements.Static) {
      const found = this.simpleType(node);
      if (found) {
        return found;
      }
//      throw new Error("unresolved!!!");
    }

// fallback to untyped
    if (sub instanceof Statements.Data
      || sub instanceof Statements.DataBegin
      || sub instanceof Statements.Constant
      || sub instanceof Statements.ConstantBegin
      || sub instanceof Statements.Static
      || sub instanceof Statements.StaticBegin) {
      return this.buildVariable(node.findFirstExpression(Expressions.NamespaceSimpleName));
    } else if (sub instanceof Statements.Parameter) {
      return this.buildVariable(node.findFirstExpression(Expressions.FieldSub));
    } else if (sub instanceof Statements.FieldSymbol) {
      return this.buildVariable(node.findFirstExpression(Expressions.FieldSymbol));
    } else if (sub instanceof Statements.Tables || sub instanceof Statements.SelectOption) {
      return this.buildVariable(node.findFirstExpression(Expressions.Field));
    }

    return undefined;
  }

//////////////////////

  private buildVariable(expr: ExpressionNode | undefined): Identifier {
    if (expr === undefined) { throw new Error("BasicTypes, unexpected tree structure"); }
    const token = expr.getFirstToken();
    return new Identifier(token, this.filename);
  }

  private tableType(node: StatementNode): TypedIdentifier | undefined {
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();

    const tab = node.findFirstExpression(Expressions.TypeTable);
    if (tab === undefined) {
      return undefined;
    }

    const row = this.resolveChainType(node, node.findFirstExpression(Expressions.FieldChain));
    if (row === undefined) {
      return undefined;
    }

    return new TypedIdentifier(name, this.filename, new Types.TableType(row));
  }

  private resolveChainType(stat: StatementNode, expr: ExpressionNode | undefined): AbstractType | undefined {
    if (expr === undefined) {
      return undefined;
    }

    const chainText = expr.concatTokens().toUpperCase();
    if (chainText === "STRING") {
      return new Types.StringType();
    } else if (chainText === "I") {
      return new Types.IntegerType();
    } else if (chainText === "F") {
      return new Types.FloatType();
    } else if (chainText === "C") {
      return new Types.CharacterType(this.findLength(stat));
    }

    // todo, this only handles simple names
    const typ = this.scope.resolveType(chainText);
    if (typ) {
      return typ.getType();
    }

    return undefined;
  }

  private simpleType(node: StatementNode): TypedIdentifier | undefined {
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();
    const chain = node.findFirstExpression(Expressions.FieldChain);

    const type = node.findFirstExpression(Expressions.Type);
    const text = type ? type.concatTokens().toUpperCase() : "TYPE";

    let found: AbstractType | undefined = undefined;
    if (text.startsWith("LIKE LINE OF")) {
      return undefined;
    } else if (text.startsWith("LIKE REF TO")) {
      return undefined;
    } else if (text.startsWith("LIKE")) {
      return undefined;
    } else if (text.startsWith("TYPE LINE OF")) {
      return undefined;
    } else if (text.startsWith("TYPE REF TO")) {
      return undefined;
    } else if (text.startsWith("TYPE")) {
      found = this.resolveChainType(node, chain);
      if (found === undefined && chain === undefined) {
        found = new Types.CharacterType(1);
      }
    }

    if (found) {
      if (node.get() instanceof Statements.Constant) {
        return new TypedConstantIdentifier(name, this.filename, found, this.findValue(node, name.getStr()));
      } else {
        return new TypedIdentifier(name, this.filename, found);
      }
    }

    return undefined;
  }

  private findValue(node: StatementNode, name: string): string {
    const val = node.findFirstExpression(Expressions.Value);
    if (val === undefined) {
      throw new Error("set VALUE, " + name);
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
      return new Chaining(this.scope).resolveConstantValue(chain);
    }

    throw new Error("findValue, unexpected, " + name);
  }

  private findLength(node: StatementNode): number {
    const flen = node.findFirstExpression(Expressions.ConstantFieldLength);
    if (flen) {
      const cintExpr = flen.findFirstExpression(Expressions.Integer);
      if (cintExpr) {
        return this.parseInt(cintExpr.concatTokens());
      }

      const cchain = flen.findFirstExpression(Expressions.SimpleFieldChain);
      if (cchain) {
        return this.parseInt(new Chaining(this.scope).resolveConstantValue(cchain));
      }
    }

    const val = node.findFirstExpression(Expressions.Length);
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
      return this.parseInt(new Chaining(this.scope).resolveConstantValue(chain));
    }

    throw new Error("Unexpected, findLength");
  }

  private parseInt(text: string): number {
    if (text.startsWith("'")) {
      text = text.split("'")[1];
    } else if (text.startsWith("`")) {
      text = text.split("`")[1];
    }

    return parseInt(text, 10);
  }

}