import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class Tables extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("TABLES"), new Field());

    return verNot(Version.Cloud, ret);
  }

  public runSyntax(node: StatementNode, _scope: Scope, filename: string): TypedIdentifier | undefined {
    const fallback = node.findFirstExpression(Expressions.Field);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Tables, todo"));
    } else {
      return undefined;
    }
  }

}