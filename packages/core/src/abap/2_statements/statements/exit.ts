import {IStatement} from "./_statement";
import {alt, opt, seq, verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Exit implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("EXIT", opt(verNotLang(LanguageVersion.Cloud, alt("FROM SQL", "FROM STEP-LOOP"))));
  }

}