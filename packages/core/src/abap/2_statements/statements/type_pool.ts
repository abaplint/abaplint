import {IStatement} from "./_statement";
import {verNotLang, seq, regex as reg} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

// type pool definition
export class TypePool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fieldName = reg(/^\w+$/);

    const ret = seq("TYPE-POOL", fieldName);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
