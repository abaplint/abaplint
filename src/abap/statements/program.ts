import {Statement} from "./statement";
import {verNot, str, seq, opt, per, optPrio, IRunnable} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../version";

export class Program extends Statement {

  public getMatcher(): IRunnable {
    let message = seq(str("MESSAGE-ID"), new Source());
    let size = seq(str("LINE-SIZE"), new Source());
    let heading = str("NO STANDARD PAGE HEADING");
    let line = seq(str("LINE-COUNT"), new Source());
    let options = per(message, size, heading, line);

    let ret = seq(str("PROGRAM"), optPrio(new Field()), opt(options));

    return verNot(Version.Cloud, ret);
  }

}