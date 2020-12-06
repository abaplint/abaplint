import {IStatement} from "./_statement";
import {verNot, seqs, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const language = seqs("LANGUAGE", Source);
    const into = seqs("INTO", Target);
    const state = seqs("STATE", Source);

    const ret = seqs("READ TEXTPOOL",
                     Source,
                     pers(into, language, state));

    return verNot(Version.Cloud, ret);
  }

}