import {Expression, ver} from "../combi";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLMappingFromEntity extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Release.v789, "MAPPING FROM ENTITY");
  }
}
