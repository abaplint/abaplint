import {Statement} from "./_statement";
import {verNot, str, seq, opt, plus, IStatementRunnable} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../version";

export class Demand extends Statement {

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