import {seq, plus, optPrio, altPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPathSegment} from "./sql_path_segment";
import {DatabaseTable} from "./database_table";
import {SQLCTEPathPrefix} from "./sql_cte_path_prefix";
import {Release} from "../../../version";

export class SQLPathForEntity extends Expression {
  private readonly withPrefix: boolean;

  /** withPrefix = false when the entity name is already parsed by the caller, eg. in SQLFromSource,
   * otherwise the prefix would match a following keyword, "FROM ztab WHERE \_assoc-col = 1" */
  public constructor(withPrefix: boolean = true) {
    super();
    this.withPrefix = withPrefix;
  }

  public getRunnable(): IStatementRunnable {
    const segments = plus(new SQLPathSegment());
    if (this.withPrefix === false) {
      return ver(Release.v740sp05, segments);
    }
    const prefix = altPrio(new SQLCTEPathPrefix(), new DatabaseTable());
    return ver(Release.v740sp05, seq(optPrio(prefix), segments));
  }
}
