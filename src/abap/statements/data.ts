import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {DataDefinition} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";
import {BasicTypes} from "../syntax/basic_types";

export class Data extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("DATA"), new DataDefinition());
  }

  public runSyntax(node: StatementNode, scope: Scope, filename: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      const ttfound = (tt.get() as Expressions.TypeTable).runSyntax(node, scope, filename);
      if (ttfound) {
        return ttfound;
      }
    }

    const found = new BasicTypes(filename, scope).simpleType(node);
    if (found) {
      return found;
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("data, fallback"));
    }

    return undefined;
  }

}