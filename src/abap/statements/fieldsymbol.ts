import {Statement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {FieldSymbol as Name, Type, TypeTable} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class FieldSymbol extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(alt(str("FIELD-SYMBOL"), str("FIELD-SYMBOLS")),
               new Name(),
               alt(new Type(), new TypeTable()));
  }

  public runSyntax(node: StatementNode, _scope: Scope, filename: string): TypedIdentifier | undefined {
    const fallback = node.findFirstExpression(Expressions.FieldSymbol);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Fieldsymbol, fallback"));
    } else {
      return undefined;
    }
  }

}