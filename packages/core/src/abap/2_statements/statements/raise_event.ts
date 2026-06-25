import {IStatement} from "./_statement";
import {seq, opt, verNotLang} from "../combi";
import {ParameterListS, EventName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class RaiseEvent implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);

    return verNotLang(LanguageVersion.KeyUser, seq("RAISE EVENT", EventName, opt(exporting)));
  }

}