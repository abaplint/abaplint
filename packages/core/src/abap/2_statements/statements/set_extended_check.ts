import {IStatement} from "./_statement";
import {verNotLang, seq, alt} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetExtendedCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET EXTENDED CHECK", alt("OFF", "ON"));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
