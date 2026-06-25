import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Transfer implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq("LENGTH", Source);

    const ret = seq("TRANSFER",
                    Source,
                    "TO",
                    Source,
                    opt(length),
                    opt("NO END OF LINE"));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
