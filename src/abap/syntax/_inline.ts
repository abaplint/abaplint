import {CurrentScope} from "./_current_scope";
import {ExpressionNode, StatementNode} from "../nodes";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {INode} from "../nodes/_inode";
import {Registry} from "../../registry";
import {Table, View} from "../../objects";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class Inline {
  private readonly scope: CurrentScope;
  private readonly reg: Registry;

  public constructor(reg: Registry, scope: CurrentScope) {
    this.scope = scope;
    this.reg = reg;
  }

  private addVariable(expr: ExpressionNode | undefined, filename: string) {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    const token = expr.getFirstToken();
    const identifier = new TypedIdentifier(token, filename, new UnknownType("todo, inline, addVariable"));
    this.scope.addIdentifier(identifier);
  }

  public update(node: INode, filename: string): boolean {
    if (node instanceof StatementNode) {

      for (const inline of node.findAllExpressions(Expressions.InlineData)) {
        const field = inline.findFirstExpression(Expressions.TargetField);
        if (field === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
        this.addVariable(field, filename);
      }

      for (const inline of node.findAllExpressions(Expressions.InlineFS)) {
        const field = inline.findFirstExpression(Expressions.TargetFieldSymbol);
        if (field === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
        this.addVariable(field, filename);
      }

      for (const inline of node.findAllExpressions(Expressions.InlineFieldDefinition)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field !== undefined) {
          this.addVariable(field, filename);
// todo, these also have to be popped after the statement
        }
      }

      for (const inline of node.findAllExpressions(Expressions.InlineLoopDefinition)) {
        const field = inline.findFirstExpression(Expressions.TargetField); // todo, this can take the field after IN
        if (field !== undefined) {
          this.addVariable(field, filename);
// todo, these also have to be popped after the statement
        }
        const fs = inline.findFirstExpression(Expressions.TargetFieldSymbol);
        if (fs !== undefined) {
          this.addVariable(fs, filename);
        }
      }

      for (const inline of node.findAllExpressions(Expressions.InlineField)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field !== undefined) {
          this.addVariable(field, filename);
// todo, these also have to be popped after the statement?
        }
      }

      if (node.get() instanceof Statements.Select || node.get() instanceof Statements.SelectLoop) {
        const fromList = node.findAllExpressions(Expressions.SQLFromSource);
        for (const from of fromList) {
          const dbtab = from.findFirstExpression(Expressions.DatabaseTable);
          if (dbtab === undefined) {
            continue;
          }
          const name = dbtab.getFirstToken().getStr();
          this.findTable(name);
        }
      }
    }

    return false;
  }

  private findTable(name: string): void {
    const table = this.reg.getObject("TABL", name) as Table | undefined;
    if (table !== undefined) {
      return;
    }
    const view = this.reg.getObject("VIEW", name) as View | undefined;
    if (view !== undefined) {
      return;
    }
    if (this.reg.inErrorNamespace(name)) {
      throw new Error("Database table or view \"" + name + "\" not found");
    } else {
      return;
    }
  }
}