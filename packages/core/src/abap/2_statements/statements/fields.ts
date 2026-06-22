import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {FieldSub} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Fields implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FIELDS", FieldSub);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
