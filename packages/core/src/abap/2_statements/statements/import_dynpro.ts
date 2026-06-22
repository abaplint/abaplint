import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ImportDynpro implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("IMPORT DYNPRO",
                    Target,
                    Target,
                    Target,
                    Target,
                    "ID",
                    Source);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
