import {IStatement} from "./_statement";
import {optPrio, seq, verNotLang} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class TypeBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("TYPES", "BEGIN OF", NamespaceSimpleName, optPrio(verNotLang(LanguageVersion.Cloud, "%_FINAL")));

    return ret;
  }

}
