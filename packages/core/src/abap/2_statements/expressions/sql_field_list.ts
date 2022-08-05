import {plusPrio, seq, ver, Expression, optPrio, altPrio} from "../combi";
import {SQLField, Dynamic} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = optPrio(ver(Version.v740sp05, ","));

    return altPrio("*",
                   Dynamic,
                   plusPrio(seq(SQLField, comma)));
  }
}