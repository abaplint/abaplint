import {seq, optPrio, altPrio, Expression, ver, tok, star} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {DatabaseTable, SQLAggregation, SQLAsName, SQLCond} from ".";

export class SQLHierarchyAggregate extends Expression {
  public getRunnable(): IStatementRunnable {
    const startWhere = seq("START", "WHERE", SQLCond);
    const join = seq("JOIN", DatabaseTable, "ON", SQLCond);
    const measureItem = seq(SQLAggregation, "AS", SQLAsName);
    const measures = seq("MEASURES", measureItem, star(seq(",", measureItem)));
    const where = seq("WHERE", SQLCond);

    const withEntry = altPrio("SUBTOTAL", "BALANCE", seq("NOT", "MATCHED"), "TOTAL");

    const aggregate = seq(
      "SOURCE", DatabaseTable,
      optPrio(startWhere),
      optPrio(join),
      measures,
      optPrio(where),
      optPrio(seq("WITH", withEntry, star(seq("WITH", withEntry)))),
    );

    const name = altPrio("HIERARCHY_DESCENDANTS_AGGREGATE", "HIERARCHY_ANCESTORS_AGGREGATE");

    return ver(Version.v750, seq(
      name,
      tok(ParenLeftW),
      aggregate,
      tok(WParenRightW),
    ));
  }
}
