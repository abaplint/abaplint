import {IStatement} from "./_statement";
import {seq, ver, starPrio, optPrio} from "../combi";
import {Select as eSelect, SQLHints} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Select implements IStatement {

  public getMatcher(): IStatementRunnable {
    const union = ver(Version.v750, seq("UNION", optPrio("DISTINCT"), eSelect));
    return seq(eSelect, starPrio(union), optPrio(SQLHints));
  }

}