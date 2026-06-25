import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Target} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FreeObject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FREE OBJECT", Target, opt("NO FLUSH"));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
