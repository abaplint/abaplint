import {seq, ver, Expression, alt, starPrio, altPrio} from "../combi";
import {SQLField, Dynamic} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const nev = ver(Version.v740sp05, starPrio(seq(",", SQLField)));
    const old = starPrio(SQLField);

    return altPrio("*",
                   Dynamic,
                   seq(SQLField, alt(nev, old)));
  }
}