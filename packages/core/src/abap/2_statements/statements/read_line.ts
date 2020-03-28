import {IStatement} from "./_statement";
import {verNot, str, seq, per, opt, alt, plus} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seq(str("LINE VALUE INTO"),
                    new Target());

    const fields = seq(new Target(), opt(seq(str("INTO"), new Target())));

    const field = seq(str("FIELD VALUE"),
                      plus(fields));

    const index = seq(str("INDEX"), new Source());

    const page = seq(str("OF PAGE"), new Source());

    const current = str("OF CURRENT PAGE");

    const ret = seq(str("READ"),
                    alt(str("CURRENT LINE"), seq(str("LINE"), new Source())),
                    opt(per(val, index, field, page, current)));

    return verNot(Version.Cloud, ret);
  }

}