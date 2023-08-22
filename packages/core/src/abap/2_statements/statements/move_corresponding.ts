import {IStatement} from "./_statement";
import {ver, seq, optPrio} from "../combi";
import {Source, SimpleTarget} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class MoveCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const keeping = ver(Version.v740sp05, "KEEPING TARGET LINES");
    const expanding = ver(Version.v740sp05, "EXPANDING NESTED TABLES");

    const move = seq("MOVE-CORRESPONDING",
                     optPrio("EXACT"),
                     Source,
                     "TO",
// inline defintions not possible in this position,
                     SimpleTarget,
                     optPrio(expanding),
                     optPrio(keeping));

    return move;
  }

}