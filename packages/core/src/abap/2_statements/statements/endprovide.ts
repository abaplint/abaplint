import {IStatement} from "./_statement";
import {verNotLang, str} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndProvide implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDPROVIDE");
    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
