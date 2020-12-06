import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seqs("ENDING AT", Source, Source);
    const starting = seqs("STARTING AT", Source, Source);
    const using = seqs("USING SELECTION-SET", Source);

    const at = seqs(starting, opts(ending));

    const ret = seqs("CALL SELECTION-SCREEN", Source, opts(at), opts(using));

    return verNot(Version.Cloud, ret);
  }

}