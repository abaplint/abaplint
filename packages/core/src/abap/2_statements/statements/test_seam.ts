import {IStatement} from "./_statement";
import {seq, ver, AlsoIn} from "../combi";
import {TestSeamName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class TestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Release.v750, seq("TEST-SEAM", TestSeamName), {also: AlsoIn.OpenABAP});
  }

}
