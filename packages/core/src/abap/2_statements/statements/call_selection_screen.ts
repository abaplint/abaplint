import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seq(str("ENDING AT"), new Source(), new Source());
    const starting = seq(str("STARTING AT"), new Source(), new Source());
    const using = seq(str("USING SELECTION-SET"), new Source());

    const at = seq(starting, opt(ending));

    const ret = seq(str("CALL SELECTION-SCREEN"), new Source(), opt(at), opt(using));

    return verNot(Version.Cloud, ret);
  }

}