import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {DataDefinition} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../../syntax/_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../../syntax/basic_types";
import {IStatementRunnable} from "../statement_runnable";
import {TypeTable} from "../../syntax/expressions/type_table";

export class Data implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("DATA"), new DataDefinition());
  }

  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      const ttfound = new TypeTable().runSyntax(node, scope, filename);
      if (ttfound) {
        return ttfound;
      }
    }

    const bfound = new BasicTypes(filename, scope).simpleType(node);
    if (bfound) {
      return bfound;
    }

    const name = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (name) {
/*
      const dfound = scope.getDDIC().lookup();
      if (dfound) {
        return new TypedIdentifier(name.getFirstToken(), filename, dfound);
      }
*/
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("data, fallback"));
    }

    return undefined;
  }

}