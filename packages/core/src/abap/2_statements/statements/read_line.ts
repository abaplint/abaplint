import {IStatement} from "./_statement";
import {verNot, str, seq, pers, opts, alt, pluss} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seq("LINE VALUE INTO", Target);

    const fields = seq(Target, opts(seq("INTO", Target)));

    const field = seq("FIELD VALUE", pluss(fields));

    const index = seq("INDEX", Source);

    const page = seq("OF PAGE", Source);

    const current = str("OF CURRENT PAGE");

    const ret = seq("READ",
                    alt("CURRENT LINE", seq("LINE", Source)),
                    opts(pers(val, index, field, page, current)));

    return verNot(Version.Cloud, ret);
  }

}