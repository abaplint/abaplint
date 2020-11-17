import {IStatement} from "./_statement";
import {str, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class RollbackEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = str("ROLLBACK ENTITIES.");
    return ver(Version.v754, s);
  }

}