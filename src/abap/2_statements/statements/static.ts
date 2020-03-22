import {IStatement} from "./_statement";
import {str, seq, opt, per, alt} from "../combi";
import * as Expressions from "../expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../../syntax/_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../../syntax/basic_types";
import {UnknownType} from "../../types/basic";
import {IStatementRunnable} from "../statement_runnable";
import {TypeTable} from "../../syntax/expressions/type_table";

export class Static implements IStatement {

  public getMatcher(): IStatementRunnable {
    const p = opt(per(new Expressions.Type(), new Expressions.Value(), new Expressions.Length(), new Expressions.Decimals()));

    const type = seq(opt(new Expressions.ConstantFieldLength()), p);

    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    new Expressions.NamespaceSimpleName(),
                    alt(type, new Expressions.TypeTable()));

    return ret;
  }

  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      const ttfound = new TypeTable().runSyntax(node, scope, filename);
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