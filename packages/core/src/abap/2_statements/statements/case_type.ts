import {IStatement} from "./_statement";
import {seq, vers} from "../combi";
import {Version} from "../../../version";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CaseType implements IStatement {

  public getMatcher(): IStatementRunnable {
    return vers(Version.v750, seq("CASE TYPE OF", Source));
  }

}