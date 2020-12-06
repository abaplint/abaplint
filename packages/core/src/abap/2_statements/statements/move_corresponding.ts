import {IStatement} from "./_statement";
import {vers, seq, optPrio} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class MoveCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const keeping = vers(Version.v740sp05, "KEEPING TARGET LINES");
    const expanding = vers(Version.v740sp05, "EXPANDING NESTED TABLES");

    const move = seq("MOVE-CORRESPONDING",
                     optPrio("EXACT"),
                     Source,
                     "TO",
                     Target,
                     optPrio(expanding),
                     optPrio(keeping));

    return move;
  }

}