import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {TestSeamName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Version.v750, seq("TEST-SEAM", TestSeamName));
  }

}