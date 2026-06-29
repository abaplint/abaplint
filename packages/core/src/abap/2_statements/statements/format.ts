import {IStatement} from "./_statement";
import {verNotLang, per, seq, opt, altPrio} from "../combi";
import {Source, Color} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Format implements IStatement {

  public getMatcher(): IStatementRunnable {
    const eq = seq("=", Source);
    const value = altPrio(eq, "ON", "OFF");

    const options = per("RESET",
                        seq("INTENSIFIED", opt(value)),
                        seq("INVERSE", opt(value)),
                        seq("HOTSPOT", opt(value)),
                        seq("FRAMES", value),
                        seq("INPUT", opt(value)),
                        Color);

    const ret = seq("FORMAT", options);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
