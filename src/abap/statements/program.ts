import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, optPrio, IRunnable} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../version";

export class Program extends Statement {

  public getMatcher(): IRunnable {
    const message = seq(str("MESSAGE-ID"), new Source());
    const size = seq(str("LINE-SIZE"), new Source());
    const heading = str("NO STANDARD PAGE HEADING");
    const line = seq(str("LINE-COUNT"), new Source());
    const options = per(message, size, heading, line);

    const ret = seq(str("PROGRAM"), optPrio(new Field()), opt(options));

    return verNot(Version.Cloud, ret);
  }

}