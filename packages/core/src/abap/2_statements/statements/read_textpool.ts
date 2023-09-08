import {IStatement} from "./_statement";
import {verNot, seq, per} from "../combi";
import {SimpleTarget, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const language = seq("LANGUAGE", Source);
    const into = seq("INTO", SimpleTarget);
    const state = seq("STATE", Source);

    const ret = seq("READ TEXTPOOL",
                    Source,
                    per(into, language, state));

    return verNot(Version.Cloud, ret);
  }

}