import {IStatement} from "./_statement";
import {verNotLang, seq, opt, plus} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LogPoint implements IStatement {

  public getMatcher(): IStatementRunnable {
    const subkey = seq("SUBKEY", Source);

    const fields = seq("FIELDS", plus(Source));

    const ret = seq("LOG-POINT ID",
                    NamespaceSimpleName,
                    opt(subkey),
                    opt(fields));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
