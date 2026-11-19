import {IStatement} from "./_statement";
import {seq, alt, opt, verNotLang} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class GetTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const stamp = seq("GET TIME STAMP FIELD", Target);
    const time = verNotLang(LanguageVersion.Cloud, seq("GET TIME", opt(seq("FIELD", Target))));

    return verNotLang(LanguageVersion.KeyUser, alt(stamp, time));
  }

}