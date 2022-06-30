import {Version} from "../../../version";
import {alt, seq, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSourceSimple} from "./sql_source_simple";

export class SQLClient extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, client specified and connection not possible in Cloud
    const client = alt("CLIENT SPECIFIED",
                       seq("USING", alt(ver(Version.v740sp05, seq("CLIENT", SQLSourceSimple)),
                                        ver(Version.v754, seq("CLIENTS IN", alt(SQLSourceSimple, "T000"))),
                                        ver(Version.v754, "ALL CLIENTS"))));
    return client;
  }
}