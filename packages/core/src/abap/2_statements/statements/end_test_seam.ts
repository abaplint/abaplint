import {IStatement} from "./_statement";
import {str, ver, AlsoIn} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class EndTestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Release.v750, str("END-TEST-SEAM"), {also: AlsoIn.OpenABAP});
  }

}
