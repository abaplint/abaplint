import {IStatement} from "./_statement";
import {seq, verNotLang} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetReference implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("GET REFERENCE OF",
                    Source,
                    "INTO",
                    Target);

    // not released for ABAP Cloud, use "ref = REF #( source )" instead
    return verNotLang(LanguageVersion.Cloud, ret);
  }

}