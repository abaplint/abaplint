import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seq("ENDING AT", Source, Source);
    const starting = seq("STARTING AT", Source, Source);
    const using = seq("USING SELECTION-SET", Source);

    const at = seq(starting, opts(ending));

    const ret = seq("CALL SELECTION-SCREEN", Source, opts(at), opts(using));

    return verNot(Version.Cloud, ret);
  }

}