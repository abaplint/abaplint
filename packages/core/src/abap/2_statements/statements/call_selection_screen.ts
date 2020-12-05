import {IStatement} from "./_statement";
import {verNot, seqs, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seqs("ENDING AT", Source, Source);
    const starting = seqs("STARTING AT", Source, Source);
    const using = seqs("USING SELECTION-SET", Source);

    const at = seqs(starting, opt(ending));

    const ret = seqs("CALL SELECTION-SCREEN", Source, opt(at), opt(using));

    return verNot(Version.Cloud, ret);
  }

}