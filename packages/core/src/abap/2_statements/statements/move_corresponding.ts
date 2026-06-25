import {IStatement} from "./_statement";
import {ver, seq, optPrio, AlsoIn} from "../combi";
import {Source, SimpleTarget} from "../expressions";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class MoveCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const keeping = ver(Release.v740sp05, "KEEPING TARGET LINES", {also: AlsoIn.OpenABAP});
    const expanding = ver(Release.v740sp05, "EXPANDING NESTED TABLES", {also: AlsoIn.OpenABAP});

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