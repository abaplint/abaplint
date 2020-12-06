import {IStatement} from "./_statement";
import {verNot, per, alt, seq, opt, altPrio} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Format implements IStatement {

  public getMatcher(): IStatementRunnable {
    const eq = seq("=", Source);
    const value = alt(eq, altPrio("ON", "OFF", Source));

    const options = per("RESET",
                        seq("INTENSIFIED", opt(value)),
                        seq("INVERSE", opt(value)),
                        seq("HOTSPOT", opt(value)),
                        seq("FRAMES", value),
                        seq("INPUT", value),
                        Color);

    const ret = seq("FORMAT", options);

    return verNot(Version.Cloud, ret);
  }

}