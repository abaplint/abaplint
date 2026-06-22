import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Window implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seq("ENDING AT", Source, Source);

    const ret = seq("WINDOW STARTING AT",
                    Source,
                    Source,
                    opt(ending));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
