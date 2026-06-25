import {IStatement} from "./_statement";
import {verNotLang, seq, per} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seq("STATE", Source);
    const into = seq("INTO", Target);
    const maximum = seq("MAXIMUM WIDTH INTO", Target);

    const ret = seq("READ REPORT",
                    Source,
                    per(state, into, maximum));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
