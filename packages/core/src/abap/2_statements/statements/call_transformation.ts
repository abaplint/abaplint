import {IStatement} from "./_statement";
import {seqs, alts, pers, plus} from "../combi";
import {Target, Field, Source, Dynamic, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransformation implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seqs(Field, "=", Source);

    const options = seqs("OPTIONS", plus(field));
    const parameters = seqs("PARAMETERS", alts(plus(field), Dynamic));
    const objects = seqs("OBJECTS", alts(plus(field), Dynamic));

    const source2 = seqs("XML", Source);
    const source = seqs("SOURCE", alts(plus(field), source2, Dynamic));

    const result2 = seqs("XML", Target);
    const result = seqs("RESULT", alts(plus(field), result2, Dynamic));

    const call = seqs("CALL TRANSFORMATION",
                      alts(NamespaceSimpleName, Dynamic),
                      pers(options, parameters, objects, source, result));
    return call;
  }

}