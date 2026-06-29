import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compute implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("COMPUTE",
                    opt("EXACT"),
                    Target,
                    "=",
                    Source);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
