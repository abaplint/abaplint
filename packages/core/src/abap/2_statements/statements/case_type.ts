import {IStatement} from "./_statement";
import {seq, ver, AlsoIn} from "../combi";
import {Release} from "../../../version";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CaseType implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Release.v750, seq("CASE TYPE OF", Source), {also: AlsoIn.OpenABAP});
  }

}