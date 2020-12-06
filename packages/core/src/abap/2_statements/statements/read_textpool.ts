import {IStatement} from "./_statement";
import {verNot, seq, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const language = seq("LANGUAGE", Source);
    const into = seq("INTO", Target);
    const state = seq("STATE", Source);

    const ret = seq("READ TEXTPOOL",
                    Source,
                    pers(into, language, state));

    return verNot(Version.Cloud, ret);
  }

}