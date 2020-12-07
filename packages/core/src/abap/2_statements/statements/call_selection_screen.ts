import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seq("ENDING AT", Source, Source);
    const starting = seq("STARTING AT", Source, Source);
    const using = seq("USING SELECTION-SET", Source);

    const at = seq(starting, opt(ending));

    const ret = seq("CALL SELECTION-SCREEN", Source, opt(at), opt(using));

    return verNot(Version.Cloud, ret);
  }

}