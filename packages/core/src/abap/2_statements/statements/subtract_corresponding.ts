import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SubtractCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SUBTRACT-CORRESPONDING",
                    Source,
                    "FROM",
                    Target);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
