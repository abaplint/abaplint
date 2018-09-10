import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, ver, plus, IRunnable} from "../combi";
import {Version} from "../../src/version";

export class Raise extends Statement {

  public static get_matcher(): IRunnable {
    let wit  = seq(str("WITH"), plus(new Reuse.Source()));

    let mess1 = seq(str("ID"), new Reuse.Source(), str("TYPE"), new Reuse.Source(), str("NUMBER"), new Reuse.Source());
    let mess2 = seq(new Reuse.Field(), str("("), new Reuse.Field(), str(")"));

    let mess = seq(str("MESSAGE"),
                   alt(mess1, mess2),
                   opt(wit));

    let exporting = seq(str("EXPORTING"), new Reuse.ParameterListS());

    let clas = seq(opt(str("RESUMABLE")),
                   str("EXCEPTION"),
                   opt(str("TYPE")),
                   new Reuse.Source(),
                   opt(alt(exporting, ver(Version.v750, mess))));

    return seq(str("RAISE"), alt(new Reuse.Field(), clas));
  }

}