import {IStatement} from "./_statement";
import {verNot, str, per, alt, seq, opt, altPrio} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Format implements IStatement {

  public getMatcher(): IStatementRunnable {
    const eq = seq(str("="), new Source());
    const value = alt(eq, altPrio(str("ON"), str("OFF"), new Source()));

    const options = per(str("RESET"),
                        seq(str("INTENSIFIED"), opt(value)),
                        seq(str("INVERSE"), opt(value)),
                        seq(str("HOTSPOT"), opt(value)),
                        seq(str("FRAMES"), value),
                        seq(str("INPUT"), value),
                        new Color());

    const ret = seq(str("FORMAT"), options);

    return verNot(Version.Cloud, ret);
  }

}