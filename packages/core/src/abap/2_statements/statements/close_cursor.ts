import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {SQLSourceSimple} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CloseCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CLOSE CURSOR", SQLSourceSimple);
    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
