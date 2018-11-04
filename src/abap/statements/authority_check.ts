import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, plus, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class AuthorityCheck extends Statement {

  public getMatcher(): IRunnable {

    let field = seq(str("FIELD"), new Source());

    let id = seq(str("ID"),
                 new Source(),
                 alt(field, str("DUMMY")));

    let ret = seq(str("AUTHORITY-CHECK OBJECT"),
                  new Source(),
                  opt(seq(str("FOR USER"), new Source())),
                  plus(id));

    return verNot(Version.Cloud, ret);
  }

}