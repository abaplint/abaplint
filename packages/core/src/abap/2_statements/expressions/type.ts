import {seqs, optPrio, alts, Expression} from "../combi";
import {TypeName, Default, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const typeType = seqs(TypeName, optPrio(new Default()));

    const ret = alts(seqs("LIKE", FieldChain),
                     seqs("LIKE LINE OF", FieldChain),
                     seqs("LIKE REF TO", FieldChain),
                     seqs("TYPE", typeType),
                     seqs("TYPE LINE OF", typeType),
                     seqs("TYPE REF TO", typeType));

    return ret;
  }
}