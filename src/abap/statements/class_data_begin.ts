import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class ClassDataBegin extends Statement {

  public getMatcher(): IStatementRunnable {

    const occurs = seq(str("OCCURS"), new Integer());

    const structure = seq(str("BEGIN OF"),
                          opt(str("COMMON PART")),
                          new NamespaceSimpleName(),
                          opt(str("READ-ONLY")),
                          opt(occurs));

    return seq(str("CLASS-DATA"), structure);
  }

  public runSyntax(node: StatementNode, _scope: CurrentScope, filename: string): TypedIdentifier | undefined {
// todo
    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("class data, fallback"));
    } else {
      return undefined;
    }
  }

}