import {IStatement} from "./_statement";
import {verNot, str, seq, opt, plus} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Demand implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(new Field(), str("="), new Target());

    const messages = seq(str("MESSAGES INTO"), new Target());

    const ret = seq(str("DEMAND"),
                    plus(field),
                    str("FROM CONTEXT"),
                    new Field(),
                    opt(messages));

    return verNot(Version.Cloud, ret);
  }

}