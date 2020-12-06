import {seq, optPrios, alt, Expression} from "../combi";
import {TypeName, Default, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const typeType = seq(TypeName, optPrios(Default));

    const ret = alt(seq("LIKE", FieldChain),
                    seq("LIKE LINE OF", FieldChain),
                    seq("LIKE REF TO", FieldChain),
                    seq("TYPE", typeType),
                    seq("TYPE LINE OF", typeType),
                    seq("TYPE REF TO", typeType));

    return ret;
  }
}