import {IStatement} from "./_statement";
import {LanguageVersion} from "../../../version";
import {seq, verNotLang} from "../combi";
import {TestSeamName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TestInjection implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, seq("TEST-INJECTION", TestSeamName));
  }

}