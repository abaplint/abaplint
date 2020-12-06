import {IStatement} from "./_statement";
import {seqs, str, ver, starPrio, optPrio} from "../combi";
import {Select as eSelect, SQLHints} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Select implements IStatement {

  public getMatcher(): IStatementRunnable {
    const union = ver(Version.v750, seqs("UNION", optPrio(str("DISTINCT")), eSelect));
    return seqs(eSelect, starPrio(union), optPrio(new SQLHints()));
  }

}