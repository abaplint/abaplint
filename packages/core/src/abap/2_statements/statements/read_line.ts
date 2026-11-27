import {IStatement} from "./_statement";
import {verNotLang, str, seq, per, opt, alt, altPrio, plus} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seq("LINE VALUE INTO", Target);

    const fields = altPrio(seq(Source, "INTO", Target), Target);

    const field = seq("FIELD VALUE", plus(fields));

    const index = seq("INDEX", Source);

    const page = seq("OF PAGE", Source);

    const current = str("OF CURRENT PAGE");

    const ret = seq("READ",
                    alt("CURRENT LINE", seq("LINE", Source)),
                    opt(per(val, index, field, page, current)));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
