import {IStatement} from "./_statement";
import {seq, verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class AddCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ADD-CORRESPONDING",
                    Source,
                    "TO",
                    Target);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
