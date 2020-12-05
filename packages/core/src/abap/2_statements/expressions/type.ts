import {seqs, optPrio, alt, Expression} from "../combi";
import {TypeName, Default, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const likeType = new FieldChain();
    const typeType = seqs(TypeName, optPrio(new Default()));

    const ret = alt(seqs("LIKE", likeType),
                    seqs("LIKE LINE OF", likeType),
                    seqs("LIKE REF TO", likeType),
                    seqs("TYPE", typeType),
                    seqs("TYPE LINE OF", typeType),
                    seqs("TYPE REF TO", typeType));

    return ret;
  }
}