import {Version} from "../../../version";
import {Expression, ver, seq, str, plus, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Constant} from "./constant";
import {SQLFieldName} from "./sql_field_name";

export class SQLCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seq(str("WHEN"), new Constant(), str("THEN"), new Constant());
    const els = seq(str("ELSE"), new Constant());

    return ver(Version.v740sp05, seq(str("CASE"), new SQLFieldName(), plus(when), opt(els), str("END")));
  }
}