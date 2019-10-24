import {Statement} from "./_statement";
import * as Expressions from "../expressions";
import {str, seq, alt, opt, IStatementRunnable, per} from "../combi";
import {NamespaceSimpleName, FieldLength, Type, Value, Length, Decimals} from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {BasicTypes} from "../syntax/basic_types";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class Constant extends Statement {

  public getMatcher(): IStatementRunnable {
    const def = seq(new NamespaceSimpleName(),
                    opt(new FieldLength()),
                    per(new Type(), new Value(), new Decimals(), new Length()));

    const ret = seq(alt(str("CONSTANT"), str("CONSTANTS")), def);

    return ret;
  }

  public runSyntax(node: StatementNode, scope: Scope, filename: string): TypedIdentifier {
    const found = new BasicTypes(filename, scope).simpleType(node);
    if (found) {
      return found;
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType());
    }

    throw new Error("Statement Constant: unexpecte structure");
  }

}