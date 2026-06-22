import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {LanguageVersion} from "../../../version";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Put implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("PUT", Field);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
