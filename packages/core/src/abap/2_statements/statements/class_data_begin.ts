import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const occurs = seq(str("OCCURS"), new Integer());

    const structure = seq(str("BEGIN OF"),
                          opt(str("COMMON PART")),
                          new NamespaceSimpleName(),
                          opt(str("READ-ONLY")),
                          opt(occurs));

    return seq(str("CLASS-DATA"), structure);
  }

}