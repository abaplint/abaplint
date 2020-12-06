import {Version} from "../../../version";
import {Expression, vers, seq, pluss, opts} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Constant} from "./constant";
import {SQLFieldName} from "./sql_field_name";

export class SQLCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seq("WHEN", Constant, "THEN", Constant);
    const els = seq("ELSE", Constant);

    return vers(Version.v740sp05, seq("CASE", SQLFieldName, pluss(when), opts(els), "END"));
  }
}