import {IStatement} from "./_statement";
import {verNot, str, per, alts, seqs, opt, altPrios} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Format implements IStatement {

  public getMatcher(): IStatementRunnable {
    const eq = seqs("=", Source);
    const value = alts(eq, altPrios("ON", "OFF", Source));

    const options = per(str("RESET"),
                        seqs("INTENSIFIED", opt(value)),
                        seqs("INVERSE", opt(value)),
                        seqs("HOTSPOT", opt(value)),
                        seqs("FRAMES", value),
                        seqs("INPUT", value),
                        new Color());

    const ret = seqs("FORMAT", options);

    return verNot(Version.Cloud, ret);
  }

}