import {seq, Expression, altPrio, optPrio, ver} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSetOpGroup} from "./sql_set_op_group";
import {buildSelectCore} from "./select_core";

export class SQLSetOp extends Expression {
  public getRunnable(): IStatementRunnable {
    const operand = altPrio(SQLSetOpGroup, buildSelectCore(undefined, false));

    const union = seq("UNION", optPrio(altPrio("DISTINCT", "ALL")));
    const intersectExcept = altPrio(seq("INTERSECT", optPrio("DISTINCT")),
                                    seq("EXCEPT", optPrio("DISTINCT")));

    const op = altPrio(ver(Version.v750, union, Version.OpenABAP),
                       ver(Version.v756, intersectExcept));

    return seq(op, operand);
  }
}
