import {IStatement} from "./_statement";
import {verNotLang, seq, opt, per} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("READ DATASET",
                    Source,
                    "INTO",
                    Target,
                    opt(per(seq("MAXIMUM LENGTH", Source),
                            seq("ACTUAL LENGTH", Target),
                            seq("LENGTH", Target))));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
