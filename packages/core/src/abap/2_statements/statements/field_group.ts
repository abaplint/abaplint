import {IStatement} from "./_statement";
import {verNotLang, seq, plus} from "../combi";
import {Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FieldGroup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FIELD-GROUPS", plus(Field));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
