import {IStatement} from "./_statement";
import {LanguageVersion} from "../../../version";
import {seq, verNotLang} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Multiply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("MULTIPLY",
                    Target,
                    "BY",
                    Source);

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}