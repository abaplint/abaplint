import {IStatement} from "./_statement";
import {seq, alt, opt, verNotLang} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class GetTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = seq(alt("STAMP FIELD", "FIELD"), Target);

    return verNotLang(LanguageVersion.KeyUser, seq("GET TIME", opt(options)));
  }

}