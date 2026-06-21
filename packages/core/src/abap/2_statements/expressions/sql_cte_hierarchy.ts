import {seq, optPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAsName} from "./sql_as_name";
import {SQLCTEAssociations} from "./sql_cte_associations";
import {Version} from "../../../version";

export class SQLCTEHierarchy extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v751, seq(
      "HIERARCHY",
      SQLAsName,
      optPrio(seq("WITH", SQLCTEAssociations)),
    ));
  }
}
