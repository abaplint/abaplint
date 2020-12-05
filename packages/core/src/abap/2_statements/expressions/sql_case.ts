import {Version} from "../../../version";
import {Expression, ver, seqs, plus, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Constant} from "./constant";
import {SQLFieldName} from "./sql_field_name";

export class SQLCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seqs("WHEN", Constant, "THEN", Constant);
    const els = seqs("ELSE", Constant);

    return ver(Version.v740sp05, seqs("CASE", SQLFieldName, plus(when), opt(els), "END"));
  }
}