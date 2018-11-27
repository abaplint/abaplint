import {Statement} from "./_statement";
import {str, seq, alt, optPrio, IStatementRunnable} from "../combi";
import {SimpleName, NamespaceSimpleName} from "../expressions";

export class DataEnd extends Statement {

  public getMatcher(): IStatementRunnable {
    const common = seq(str("COMMON PART"), optPrio(new SimpleName()));

    const structure = seq(str("END OF"),
                          alt(common, new NamespaceSimpleName()));

    return seq(str("DATA"), structure);
  }

}