import {IStatement} from "./_statement";
import {verNot, str, per, alt, seq, opt, IStatementRunnable, altPrio} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class Format implements IStatement {

  public getMatcher(): IStatementRunnable {
    const eq = seq(str("="), new Source());
    const value = alt(eq, altPrio(str("ON"), str("OFF"), new Source()));
    const toggle = alt(str("ON"), str("OFF"));

    const options = per(str("RESET"),
                        seq(str("INTENSIFIED"), opt(value)),
                        seq(str("INVERSE"), opt(value)),
                        seq(str("HOTSPOT"), opt(value)),
                        seq(str("FRAMES"), value),
                        seq(str("INPUT"), value),
                        seq(str("COLOR"), value, opt(toggle)));

    const ret = seq(str("FORMAT"), options);

    return verNot(Version.Cloud, ret);
  }

}