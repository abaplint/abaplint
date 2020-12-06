import {IStatement} from "./_statement";
import {verNot, str, seqs, optPrio} from "../combi";
import {Select, SQLTarget, SQLHints} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("OPEN CURSOR",
                     optPrio(str("WITH HOLD")),
                     SQLTarget,
                     "FOR",
                     Select,
                     optPrio(new SQLHints()));

    return verNot(Version.Cloud, ret);
  }

}