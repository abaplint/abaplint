import {Statement} from "./_statement";
import {str, seq, opt, per, alt, IStatementRunnable} from "../combi";
import {Value, Type, FieldLength, NamespaceSimpleName, TypeTable, Length} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {BasicTypes} from "../syntax/basic_types";
import {UnknownType} from "../types/basic";

export class Static extends Statement {

  public getMatcher(): IStatementRunnable {
    const p = opt(per(new Type(), new Value(), new Length()));

    const type = seq(opt(new FieldLength()), p);

    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    new NamespaceSimpleName(),
                    alt(type, new TypeTable()));

    return ret;
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
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Static, fallback"));
    }

    return undefined;
  }

}