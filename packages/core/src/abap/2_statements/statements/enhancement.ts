import {IStatement} from "./_statement";
import {verNotLang, seq, plus} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {NamespaceSimpleName} from "../expressions/namespace_simple_name";

export class Enhancement implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ENHANCEMENT", plus(NamespaceSimpleName));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
