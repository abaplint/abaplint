import {Statement} from "./statement";
import {verNot, str, seq, plus, IRunnable} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../version";

export class Demand extends Statement {

  public static get_matcher(): IRunnable {
    let field = seq(new Field(), str("="), new Target());

    let ret = seq(str("DEMAND"),
                  plus(field),
                  str("FROM CONTEXT"),
                  new Field());

    return verNot(Version.Cloud, ret);
  }

}