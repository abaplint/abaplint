import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, ver, plus, IRunnable} from "../combi";
import {Version} from "../../version";
import {Source, Field, ParameterListS} from "../expressions";

export class Raise extends Statement {

  public static get_matcher(): IRunnable {
    let wit  = seq(str("WITH"), plus(new Source()));

    let mess1 = seq(str("ID"), new Source(), str("TYPE"), new Source(), str("NUMBER"), new Source());
    let mess2 = seq(new Field(), str("("), new Field(), str(")"));

    let mess = seq(str("MESSAGE"),
                   alt(mess1, mess2),
                   opt(wit));

    let exporting = seq(str("EXPORTING"), new ParameterListS());

    let clas = seq(opt(str("RESUMABLE")),
                   str("EXCEPTION"),
                   opt(str("TYPE")),
                   new Source(),
                   opt(alt(exporting, ver(Version.v750, mess))));

    let ret = seq(str("RAISE"), alt(new Field(), clas));

    return verNot(Version.Cloud, ret);
  }

}