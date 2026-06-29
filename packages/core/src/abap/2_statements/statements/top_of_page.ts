import {IStatement} from "./_statement";
import {verNotLang, opt, seq} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TopOfPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("TOP-OF-PAGE", opt("DURING LINE-SELECTION"));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
