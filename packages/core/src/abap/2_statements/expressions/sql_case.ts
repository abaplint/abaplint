import {Version} from "../../../version";
import {Expression, ver, alt, seq, plus, optPrio, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Constant} from "./constant";
import {SQLCond} from "./sql_cond";
import {SQLFieldName} from "./sql_field_name";
import {SQLSource} from "./sql_source";

export class SQLCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seq("WHEN", alt(Constant, SQLCond), "THEN", SQLSource);
    const els = seq("ELSE", SQLSource);

    return ver(Version.v740sp05, seq("CASE", opt(SQLFieldName), plus(when), optPrio(els), "END"));
  }
}