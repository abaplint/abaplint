import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class ConstantBegin extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CONSTANTS"), str("BEGIN"), str("OF"), new NamespaceSimpleName());
    return ret;
  }

  public runSyntax(node: StatementNode, _scope: Scope, filename: string): TypedIdentifier | undefined {
    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType());
    } else {
      return undefined;
    }
  }

}