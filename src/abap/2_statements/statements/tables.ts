import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import * as Expressions from "../expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../../syntax/_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {IStatementRunnable} from "../statement_runnable";

export class Tables implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("TABLES"), new Field());

    return verNot(Version.Cloud, ret);
  }

  public runSyntax(node: StatementNode, _scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const fallback = node.findFirstExpression(Expressions.Field);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Tables, todo"));
    } else {
      return undefined;
    }
  }

}