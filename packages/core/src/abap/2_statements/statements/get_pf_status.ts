import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq("PROGRAM", Source);
    const excl = seq("EXCLUDING", Source);

    const ret = seq("GET PF-STATUS",
                    Target,
                    opt(program),
                    opt(excl));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
