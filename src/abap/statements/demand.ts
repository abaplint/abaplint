import {Statement} from "./statement";
import {verNot, str, seq, opt, plus, IRunnable} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../version";

export class Demand extends Statement {

  public getMatcher(): IRunnable {
    let field = seq(new Field(), str("="), new Target());

    let messages = seq(str("MESSAGES INTO"), new Target());

    let ret = seq(str("DEMAND"),
                  plus(field),
                  str("FROM CONTEXT"),
                  new Field(),
                  opt(messages));

    return verNot(Version.Cloud, ret);
  }

}