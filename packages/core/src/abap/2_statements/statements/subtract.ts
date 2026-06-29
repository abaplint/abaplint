import {IStatement} from "./_statement";
import {LanguageVersion} from "../../../version";
import {seq, verNotLang} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Subtract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SUBTRACT",
                    Source,
                    "FROM",
                    Target);

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}