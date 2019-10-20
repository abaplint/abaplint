import {TypedIdentifier} from "../types/_typed_identifier";
import {StatementNode, ExpressionNode} from "../nodes";
import {Identifier} from "../types/_identifier";
import * as Statements from "../statements";
import * as Expressions from "../expressions";
import * as Types from "../types/basic/";
import {Scope} from "./_scope";
import {BasicType} from "../types/basic/_basic_type";
import {TypedConstantIdentifier} from "../types/_typed_constant_identifier";

export class BasicTypes {
  private readonly filename: string;
//  private readonly scope: Scope;

  public constructor(filename: string, _scope: Scope) {
    this.filename = filename;
//    this.scope = scope;
  }

  public build(node: StatementNode): TypedIdentifier | Identifier | undefined {
    const sub = node.get();

    const found = this.simpleType(node);
    if (found) {
      return found;
    }

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

  private simpleType(node: StatementNode): TypedIdentifier | undefined {
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();

    const type = node.findFirstExpression(Expressions.Type);
    if (type === undefined) {
      return undefined;
    }

    const chain = node.findFirstExpression(Expressions.FieldChain);
    if (chain === undefined) {
      return undefined;
    }
    const chainText = chain.concatTokens().toUpperCase();

    const text = type.concatTokens().toUpperCase();

    let found: BasicType | undefined = undefined;
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
      if (chainText === "STRING") {
        found = new Types.StringType();
      } else if (chainText === "I") {
        found = new Types.IntegerType();
      } else if (chainText === "C") {
        found = new Types.CharacterType(1);
      } else {
        return undefined;
      }
    }

    if (found) {
      if (node.get() instanceof Statements.Constant) {
        return new TypedConstantIdentifier(name, this.filename, found, this.findValue(node, name.getStr()));
      } else {
        return new TypedIdentifier(name, this.filename, found);
      }
    } else {
      return undefined;
    }
  }

  private findValue(node: StatementNode, name: string): string {
    const val = node.findFirstExpression(Expressions.Value);
    if (val === undefined) {
      throw new Error("set VALUE, " + name);
    }

    const constant = val.findFirstExpression(Expressions.Constant);
    if (constant) {
      return constant.concatTokens();
    }

    throw new Error("findValue, unexpected, " + name);
  }

}