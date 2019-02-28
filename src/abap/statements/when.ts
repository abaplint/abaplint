import {Statement} from "./_statement";
import {str, seq, star, ver, IStatementRunnable, altPrio} from "../combi";
import {Source, InlineData} from "../expressions";
import {Version} from "../../version";

export class When extends Statement {

  public getMatcher(): IStatementRunnable {
    const sourc = seq(new Source(), star(seq(str("OR"), new Source())));
    const type = ver(Version.v750, seq(str("TYPE"), new Source(), str("INTO"), new InlineData()));
    return seq(str("WHEN"),
               altPrio(str("OTHERS"), type, sourc));
  }

}