import {seq, optPrio, altPrio, Expression, ver, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {DatabaseTable, SQLCond, SQLSource} from ".";

export class SQLHierarchyAccessor extends Expression {
  public getRunnable(): IStatementRunnable {
    const distanceTo = seq("TO", SQLSource);
    const distanceFrom = seq("FROM", SQLSource, optPrio(distanceTo));
    const distance = seq("DISTANCE", altPrio(distanceFrom, distanceTo));

    const accessor = seq(
      "SOURCE", DatabaseTable,
      "START", "WHERE", SQLCond,
      optPrio(distance),
    );

    const name = altPrio("HIERARCHY_DESCENDANTS", "HIERARCHY_ANCESTORS", "HIERARCHY_SIBLINGS");

    return ver(Release.v750, seq(
      name,
      tok(ParenLeftW),
      accessor,
      tok(WParenRightW),
    ));
  }
}
