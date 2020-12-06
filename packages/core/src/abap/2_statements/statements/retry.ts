import {IStatement} from "./_statement";
import {vers} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Retry implements IStatement {

  public getMatcher(): IStatementRunnable {
    return vers(Version.v702, "RETRY");
  }

}