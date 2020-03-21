import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";

export class DataBegin extends Statement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq(str("OCCURS"), new Integer());

    const structure = seq(str("BEGIN OF"),
                          opt(str("COMMON PART")),
                          new NamespaceSimpleName(),
                          opt(str("READ-ONLY")),
                          opt(occurs));

    return seq(str("DATA"), structure);
  }

}