import {IStatement} from "./_statement";
import {verNotLang, seq, opt, alt} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class NewLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("NEW-LINE",
                    opt(alt("SCROLLING", "NO-SCROLLING")));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
