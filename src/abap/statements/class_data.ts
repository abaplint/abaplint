import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {DataDefinition} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class ClassData extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CLASS-DATA"), new DataDefinition());
  }

  public runSyntax(node: StatementNode, _scope: Scope, filename: string): TypedIdentifier | undefined {
// todo
    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("class data, fallback"));
    } else {
      return undefined;
    }
  }

}