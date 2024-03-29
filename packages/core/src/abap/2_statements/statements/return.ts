import {IStatement} from "./_statement";
import {optPrio, seq, str, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {Source} from "../expressions";

export class Return implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("RETURN"), optPrio(ver(Version.v758, Source)));
  }

}