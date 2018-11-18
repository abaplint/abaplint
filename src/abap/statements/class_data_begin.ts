import {Statement} from "./_statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";

export class ClassDataBegin extends Statement {

  public getMatcher(): IRunnable {

    const occurs = seq(str("OCCURS"), new Integer());

    const structure = seq(str("BEGIN OF"),
                          opt(str("COMMON PART")),
                          new NamespaceSimpleName(),
                          opt(str("READ-ONLY")),
                          opt(occurs));

    return seq(str("CLASS-DATA"), structure);
  }

}