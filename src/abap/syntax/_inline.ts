import {Scope} from "./_scope";
import {Identifier} from "../types/_identifier";
import {ExpressionNode, StatementNode} from "../nodes";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {INode} from "../nodes/_inode";
import {Registry} from "../../registry";
import {Table, View} from "../../objects";

class LocalIdentifier extends Identifier { }

export class Inline {
  private readonly variables: Scope;
  private readonly reg: Registry;

  constructor(variables: Scope, reg: Registry) {
    this.variables = variables;
    this.reg = reg;
  }

  private addVariable(expr: ExpressionNode | undefined, filename: string) {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    this.variables.addIdentifier(new LocalIdentifier(token, filename));
  }

  public update(node: INode, filename: string): boolean {
    if (node instanceof StatementNode) {

      for (const inline of node.findAllExpressions(Expressions.InlineData)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
        this.addVariable(field, filename);
      }

      for (const inline of node.findAllExpressions(Expressions.InlineFS)) {
        const field = inline.findFirstExpression(Expressions.FieldSymbol);
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
        const field = inline.findFirstExpression(Expressions.Field); // todo, this can take the field after IN
        if (field !== undefined) {
          this.addVariable(field, filename);
// todo, these also have to be popped after the statement
        }
        const fs = inline.findFirstExpression(Expressions.FieldSymbol);
        if (fs !== undefined) {
          this.addVariable(fs, filename);
        }
      }

      for (const inline of node.findAllExpressions(Expressions.InlineField)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field !== undefined) {
          this.addVariable(field, filename);
// todo, these also have to be popped after the statement
        }
      }

      if (node.get() instanceof Statements.Select || node.get() instanceof Statements.SelectLoop) {
        const fromList = node.findAllExpressions(Expressions.SQLFromSource);
        for (const from of fromList) {
          const dbtab = from.findFirstExpression(Expressions.DatabaseTable);
          if (dbtab === undefined) {
            continue;
          }
          let name = dbtab.getFirstToken().getStr();
          const fields = this.findFields(name);
          if (fields.length === 0) {
            return true; // skip the statement, it uses things outside of checked namespace
          }
          const asName = from.findFirstExpression(Expressions.SQLAsName);
          if (asName) {
            name = asName.getFirstToken().getStr();
          }
          for (const field of fields) {
            this.variables.addName(name + "~" + field);
          }
// todo, these also have to be popped after the statement
        }
      }
    }

    return false;
  }

  private findFields(name: string): string[] {
    const table = this.reg.getObject("TABL", name) as Table | undefined;
    if (table !== undefined) {
      return table.getFields();
    }
    const view = this.reg.getObject("VIEW", name) as View | undefined;
    if (view !== undefined) {
      return view.getFields();
    }
    const reg = new RegExp(this.reg.getConfig().getSyntaxSetttings().errorNamespace, "i");
    if (name.match(reg)) {
      throw new Error("Database table or view \"" + name + "\" not found");
    } else {
      return [];
    }
  }
}