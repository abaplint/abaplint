import {seqs, opts, optPrio, altPrios, alts, Expression} from "../combi";
import {Constant, FieldChain, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParamType extends Expression {
  public getRunnable(): IStatementRunnable {
    const def = seqs("DEFAULT", alts(Constant, FieldChain));

    const table = seqs(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                       "TABLE");

    const tabseq = seqs(table, optPrio(seqs("OF", TypeName)));

    const ret = seqs(optPrio(alts("REF TO", "LINE OF")),
                     TypeName,
                     opts(def));

    const like = seqs("LIKE", optPrio(alts("REF TO", "LINE OF")),
                      FieldChain);

    return alts(seqs("TYPE", altPrios(tabseq, ret)), like);
  }
}
