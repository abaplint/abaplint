import {IStatement} from "./_statement";
import {verNotLang, seq, opt, per} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetPFStatus implements IStatement {

  public getMatcher(): IStatementRunnable {
    const program = seq("OF PROGRAM", Source);

    const options = per(program,
                        "IMMEDIATELY",
                        seq("EXCLUDING", Source));

    const ret = seq("SET PF-STATUS",
                    Source,
                    opt(options));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
