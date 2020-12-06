import {IStatement} from "./_statement";
import {str, ver, seqs, optPrios} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class MoveCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const keeping = ver(Version.v740sp05, str("KEEPING TARGET LINES"));
    const expanding = ver(Version.v740sp05, str("EXPANDING NESTED TABLES"));

    const move = seqs("MOVE-CORRESPONDING",
                      optPrios("EXACT"),
                      Source,
                      "TO",
                      Target,
                      optPrios(expanding),
                      optPrios(keeping));

    return move;
  }

}