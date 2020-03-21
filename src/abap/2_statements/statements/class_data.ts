import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {DataDefinition} from "../expressions";
import * as Expressions from "../expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../../syntax/_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";

export class ClassData extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CLASS-DATA"), new DataDefinition());
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