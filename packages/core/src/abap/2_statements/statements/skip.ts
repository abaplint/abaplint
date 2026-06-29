import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Skip implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SKIP",
                    opt("TO LINE"),
                    opt(Source));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
