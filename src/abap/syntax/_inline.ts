import {Variables} from "./_variables";
import {TypedIdentifier} from "../types/_typed_identifier";
import {ExpressionNode, StatementNode} from "../nodes";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {INode} from "../nodes/_inode";
import {Registry} from "../../registry";
import {Table, View} from "../../objects";

class LocalIdentifier extends TypedIdentifier { }

export class Inline {
  private variables: Variables;
  private reg: Registry;
  private errorNamespace: string;

  constructor(variables: Variables, reg: Registry, errorNamespace: string) {
    this.variables = variables;
    this.errorNamespace = errorNamespace;
    this.reg = reg;
  }

  private addVariable(expr: ExpressionNode | undefined) {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    this.variables.add(new LocalIdentifier(token, expr));
  }

  public update(node: INode) {
    if (node instanceof StatementNode) {

      for (const inline of node.findAllExpressions(Expressions.InlineData)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
        this.addVariable(field);
      }

      for (const inline of node.findAllExpressions(Expressions.InlineFor)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field !== undefined) {
          this.addVariable(field);
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
          const asName = from.findFirstExpression(Expressions.SQLAsName);
          if (asName) {
            name = asName.getFirstToken().getStr();
          }
          for (const field of fields) {
            this.variables.addOther(name + "~" + field);
          }
// todo, these also have to be popped after the statement
        }
      }
    }
  }

  private findFields(name: string): string[] {
    const table = this.reg.getObject("TABL", name) as Table;
    if (table !== undefined) {
      return table.getFields();
    }
    const view = this.reg.getObject("VIEW", name) as View;
    if (view !== undefined) {
      return view.getFields();
    }
    const reg = new RegExp(this.errorNamespace, "i");
    if (name.match(reg)) {
      throw new Error("Database table or view \"" + name + "\" not found");
    } else {
      return [];
    }
  }
}