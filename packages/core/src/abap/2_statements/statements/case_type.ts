import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {Version} from "../../../version";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CaseType implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Version.v750, seq("CASE TYPE OF", Source), Version.OpenABAP);
  }

}