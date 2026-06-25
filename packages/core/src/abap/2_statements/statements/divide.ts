import {IStatement} from "./_statement";
import {LanguageVersion} from "../../../version";
import {seq, verNotLang} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Divide implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("DIVIDE",
                    Target,
                    "BY",
                    Source);

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}