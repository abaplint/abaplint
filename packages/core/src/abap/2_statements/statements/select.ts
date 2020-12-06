import {IStatement} from "./_statement";
import {seqs, ver, starPrios, optPrios} from "../combi";
import {Select as eSelect, SQLHints} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Select implements IStatement {

  public getMatcher(): IStatementRunnable {
    const union = ver(Version.v750, seqs("UNION", optPrios("DISTINCT"), eSelect));
    return seqs(eSelect, starPrios(union), optPrios(SQLHints));
  }

}