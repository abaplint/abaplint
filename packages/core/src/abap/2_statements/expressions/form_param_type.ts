import {seq, opts, optPrios, altPrios, alts, Expression} from "../combi";
import {Constant, FieldChain, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParamType extends Expression {
  public getRunnable(): IStatementRunnable {
    const def = seq("DEFAULT", alts(Constant, FieldChain));

    const table = seq(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                      "TABLE");

    const tabseq = seq(table, optPrios(seq("OF", TypeName)));

    const ret = seq(optPrios(alts("REF TO", "LINE OF")),
                    TypeName,
                    opts(def));

    const like = seq("LIKE", optPrios(alts("REF TO", "LINE OF")),
                     FieldChain);

    return alts(seq("TYPE", altPrios(tabseq, ret)), like);
  }
}
