import {IStatement} from "./_statement";
import {regex, seq, verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AtPF implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.Cloud, seq("AT", regex(/^PF\d\d?$/i)));
  }

}
