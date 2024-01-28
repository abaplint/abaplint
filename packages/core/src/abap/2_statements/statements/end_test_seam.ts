import {IStatement} from "./_statement";
import {str, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class EndTestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Version.v750, str("END-TEST-SEAM"));
  }

}