import {IStatement} from "./_statement";
import {str, ver, seq, optPrio} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class MoveCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const keeping = ver(Version.v740sp05, str("KEEPING TARGET LINES"));
    const expanding = ver(Version.v740sp05, str("EXPANDING NESTED TABLES"));

    const move = seq(str("MOVE-CORRESPONDING"),
                     optPrio(str("EXACT")),
                     new Source(),
                     str("TO"),
                     new Target(),
                     optPrio(expanding),
                     optPrio(keeping));

    return move;
  }

}