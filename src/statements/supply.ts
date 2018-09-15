import {Statement} from "./statement";
import {verNot, str, seq, plus, IRunnable} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../version";

export class Supply extends Statement {

  public static get_matcher(): IRunnable {
    let field = seq(new Field(), str("="), new Source());

    let ret = seq(str("SUPPLY"),
                  plus(field),
                  str("TO CONTEXT"),
                  new Field());

    return verNot(Version.Cloud, ret);
  }

}