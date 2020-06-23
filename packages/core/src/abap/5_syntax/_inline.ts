import {CurrentScope} from "./_current_scope";
import {ExpressionNode, StatementNode} from "../nodes";
import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import {IRegistry} from "../../_iregistry";
import {Table, View} from "../../objects";
import {TypedIdentifier, IdentifierMeta} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";
import {SelectionScreen} from "./statements/selection_screen";

export class Inline {
  private readonly scope: CurrentScope;
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry, scope: CurrentScope) {
    this.scope = scope;
    this.reg = reg;
  }

  // returns an optional issue description
  public update(node: StatementNode, filename: string): string | undefined {
    if (node.get() instanceof Statements.SelectionScreen) {
      this.scope.addIdentifier(new SelectionScreen().runSyntax(node, this.scope, filename));
      return undefined;
    }

    if (!(node.get() instanceof Statements.Move)
        && !(node.get() instanceof Statements.Catch)
        && !(node.get() instanceof Statements.Loop)
        && !(node.get() instanceof Statements.Select)
        && !(node.get() instanceof Statements.Split)
        && !(node.get() instanceof Statements.ReadTable)
        && !(node.get() instanceof Statements.Call)) {
      for (const inline of node.findAllExpressions(Expressions.InlineData)) {
        const field = inline.findFirstExpression(Expressions.TargetField);
        if (field === undefined) {
          return "syntax_check, unexpected tree structure";
        }
        this.addVariable(field, filename);
      }
    }

    if(!(node.get() instanceof Statements.Loop)
        && !(node.get() instanceof Statements.ReadTable)
        && !(node.get() instanceof Statements.InsertInternal)) {
      for (const inline of node.findAllExpressions(Expressions.InlineFS)) {
        const field = inline.findFirstExpression(Expressions.TargetFieldSymbol);
        if (field === undefined) {
          return "syntax_check, unexpected tree structure";
        }
        this.addVariable(field, filename);
      }
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
        const message = this.findTable(name);
        if (message) {
          return message;
        }
      }
    }

    const targets = node.findAllExpressions(Expressions.TargetField).concat(node.findAllExpressions(Expressions.TargetFieldSymbol));
    for (const target of targets) {
      const token = target.getFirstToken();
      const resolved = this.scope.findVariable(token.getStr());
      if (resolved === undefined) {
        return "\"" + token.getStr() + "\" not found";
      } else {
        this.scope.addWrite(token, resolved, filename);
      }
    }

    const sources = node.findAllExpressions(Expressions.SourceField).concat(node.findAllExpressions(Expressions.SourceFieldSymbol));
    for (const source of sources) {
      const token = source.getFirstToken();
      const resolved = this.scope.findVariable(token.getStr());
      if (resolved === undefined) {
        return "\"" + token.getStr() + "\" not found";
      } else {
        this.scope.addRead(token, resolved, filename);
      }
    }

    return undefined;
  }

//////////////////////////////////////////

  private addVariable(expr: ExpressionNode | undefined, filename: string) {
    if (expr === undefined) {
      throw new Error("syntax_check, unexpected tree structure");
    }
    const token = expr.getFirstToken();
    const identifier = new TypedIdentifier(token, filename, new UnknownType("todo, inline, addVariable"), [IdentifierMeta.InlineDefinition]);
    this.scope.addIdentifier(identifier);
  }

  // returns string with error or undefined
  // todo: refactor to use this.scope.getDDIC()
  private findTable(name: string): string | undefined {
    const table = this.reg.getObject("TABL", name) as Table | undefined;
    if (table !== undefined) {
      return undefined;
    }
    const view = this.reg.getObject("VIEW", name) as View | undefined;
    if (view !== undefined) {
      return undefined;
    }
    if (this.reg.inErrorNamespace(name)) {
      return "Database table or view \"" + name + "\" not found";
    } else {
      return;
    }
  }
}