import {IStatement} from "./_statement";
import {verNotLang, str} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndEnhancementSection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("END-ENHANCEMENT-SECTION");

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
