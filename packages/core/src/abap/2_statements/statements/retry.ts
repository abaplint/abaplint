import {IStatement} from "./_statement";
import {ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class Retry implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Release.v702, "RETRY");
  }

}