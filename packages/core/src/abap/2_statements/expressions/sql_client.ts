import {alts, seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSourceSimple} from "./sql_source_simple";

export class SQLClient extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, client specified and connection not possible in Cloud
    const client = alts("CLIENT SPECIFIED", seq("USING CLIENT", SQLSourceSimple));
    return client;
  }
}