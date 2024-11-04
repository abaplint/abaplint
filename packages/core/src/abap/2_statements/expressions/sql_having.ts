import {altPrio, Expression, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLAggregation} from "./sql_aggregation";
import {SQLCompareOperator} from "./sql_compare_operator";
import {SQLSource} from "./sql_source";

export class SQLHaving extends Expression {
  public getRunnable(): IStatementRunnable {
    const cond = seq(SQLAggregation, SQLCompareOperator, SQLSource);
    const having = seq("HAVING", altPrio(Dynamic, cond));
    return having;
  }
}