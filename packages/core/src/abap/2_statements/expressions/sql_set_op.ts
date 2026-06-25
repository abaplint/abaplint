import {seq, Expression, altPrio, optPrio, ver, AlsoIn} from "../combi";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSetOpGroup} from "./sql_set_op_group";
import {buildSelectCore} from "./_select_core";

export class SQLSetOp extends Expression {
  public getRunnable(): IStatementRunnable {
    const operand = altPrio(SQLSetOpGroup, seq("SELECT", buildSelectCore(false, false)));

    const union = seq("UNION", optPrio(altPrio("DISTINCT", "ALL")));
    const intersectExcept = altPrio(seq("INTERSECT", optPrio("DISTINCT")),
                                    seq("EXCEPT", optPrio("DISTINCT")));

    const op = altPrio(ver(Release.v750, union, {also: AlsoIn.OpenABAP}),
                       ver(Release.v756, intersectExcept));

    return seq(op, operand);
  }
}
