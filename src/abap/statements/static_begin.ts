import {Statement} from "./_statement";
import {str, seq, alt, opt, IStatementRunnable} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class StaticBegin extends Statement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq(str("OCCURS"), new Integer());

    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    str("BEGIN OF"),
                    new NamespaceSimpleName(),
                    opt(occurs));

    return ret;
  }

  public runSyntax(node: StatementNode, _scope: Scope, filename: string): TypedIdentifier | undefined {
    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Static begin, todo"));
    } else {
      return undefined;
    }
  }

}