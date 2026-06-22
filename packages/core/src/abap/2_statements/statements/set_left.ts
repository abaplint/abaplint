import {IStatement} from "./_statement";
import {verNotLang, opt, seq} from "../combi";
import {LanguageVersion} from "../../../version";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetLeft implements IStatement {

  public getMatcher(): IStatementRunnable {
    const column = seq("COLUMN", Source);
    return verNotLang(LanguageVersion.Cloud, seq("SET LEFT SCROLL-BOUNDARY", opt(column)));
  }

}
