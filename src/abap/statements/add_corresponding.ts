import {Statement} from "./_statement";
import {str, seq, IRunnable, verNot} from "../combi";
import {Version} from "../../version";
import {Target, Source} from "../expressions";

export class AddCorresponding extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("ADD-CORRESPONDING"),
                    new Source(),
                    str("TO"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}