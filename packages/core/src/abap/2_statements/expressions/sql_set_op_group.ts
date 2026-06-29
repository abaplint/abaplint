import {seq, optPrio, plusPrio, Expression, altPrio, ver, AlsoIn} from "../combi";
import {SQLSetOp, SQLOrderBy} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {buildSelectCore} from "./_select_core";

export class SQLSetOpGroup extends Expression {
  public getRunnable(): IStatementRunnable {
    const operand = altPrio(SQLSetOpGroup, seq("SELECT", buildSelectCore(false, false)));
    const chain = seq(operand, optPrio(seq(ver(Release.v750, plusPrio(SQLSetOp), {also: AlsoIn.OpenABAP}), optPrio(SQLOrderBy))));

    return ver(Release.v750, seq("(", chain, ")"), {also: AlsoIn.OpenABAP});
  }
}
