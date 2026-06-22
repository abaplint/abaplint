import {IStatement} from "./_statement";
import {verNotLang, seq, regex as reg} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

// type pool usage
export class TypePools implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fieldName = reg(/^\w+$/);

    const ret = seq("TYPE-POOLS", fieldName);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
