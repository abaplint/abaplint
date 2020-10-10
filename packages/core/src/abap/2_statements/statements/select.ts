import {IStatement} from "./_statement";
import {seq, str, ver, starPrio, optPrio} from "../combi";
import {Select as eSelect, SQLHints} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Select implements IStatement {

  public getMatcher(): IStatementRunnable {
    const union = ver(Version.v750, seq(str("UNION"), optPrio(str("DISTINCT")), new eSelect()));
    return seq(new eSelect(), starPrio(union), optPrio(new SQLHints()));
  }

}