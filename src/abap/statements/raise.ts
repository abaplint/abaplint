import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, ver, plus, IStatementRunnable} from "../combi";
import {Version} from "../../version";
import {Source, Field, ParameterListS} from "../expressions";

export class Raise extends Statement {

  public getMatcher(): IStatementRunnable {
    const wit  = seq(str("WITH"), plus(new Source()));

    const mess1 = seq(str("ID"), new Source(), str("TYPE"), new Source(), str("NUMBER"), new Source());
    const mess2 = seq(new Field(), str("("), new Field(), str(")"));

    const mess = seq(str("MESSAGE"),
                     alt(mess1, mess2),
                     opt(wit));

    const exporting = seq(str("EXPORTING"), new ParameterListS());

    const clas = seq(opt(str("RESUMABLE")),
                     str("EXCEPTION"),
                     opt(str("TYPE")),
                     new Source(),
                     opt(alt(ver(Version.v750, mess), ver(Version.v752, str("USING MESSAGE")))),
                     opt(exporting));

    const ret = seq(str("RAISE"), alt(new Field(), clas));

    return verNot(Version.Cloud, ret);
  }

}