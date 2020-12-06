import {IStatement} from "./_statement";
import {ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class RollbackEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = "ROLLBACK ENTITIES";
    return ver(Version.v754, s);
  }

}