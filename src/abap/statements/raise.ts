import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, ver, plus, IRunnable} from "../combi";
import {Version} from "../../version";
import {Source, Field, ParameterListS} from "../expressions";

export class Raise extends Statement {

  public getMatcher(): IRunnable {
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
                   opt(alt(ver(Version.v750, mess), ver(Version.v752, str("USING MESSAGE")))),
                   opt(exporting));

    let ret = seq(str("RAISE"), alt(new Field(), clas));

    return verNot(Version.Cloud, ret);
  }

}