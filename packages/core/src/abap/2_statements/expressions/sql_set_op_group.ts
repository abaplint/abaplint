import {seq, optPrio, plusPrio, Expression, altPrio, ver} from "../combi";
import {SQLSetOp, SQLOrderBy} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {buildSelectCore} from "./_select_core";

export class SQLSetOpGroup extends Expression {
  public getRunnable(): IStatementRunnable {
    const operand = altPrio(SQLSetOpGroup, seq("SELECT", buildSelectCore(false, false)));
    const chain = seq(operand, optPrio(seq(ver(Version.v750, plusPrio(SQLSetOp), Version.OpenABAP), optPrio(SQLOrderBy))));

    return ver(Version.v750, seq("(", chain, ")"), Version.OpenABAP);
  }
}
