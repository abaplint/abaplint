import {IStatement} from "./_statement";
import {seqs, alts, pers, pluss} from "../combi";
import {Target, Field, Source, Dynamic, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransformation implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seqs(Field, "=", Source);

    const options = seqs("OPTIONS", pluss(field));
    const parameters = seqs("PARAMETERS", alts(pluss(field), Dynamic));
    const objects = seqs("OBJECTS", alts(pluss(field), Dynamic));

    const source2 = seqs("XML", Source);
    const source = seqs("SOURCE", alts(pluss(field), source2, Dynamic));

    const result2 = seqs("XML", Target);
    const result = seqs("RESULT", alts(pluss(field), result2, Dynamic));

    const call = seqs("CALL TRANSFORMATION",
                      alts(NamespaceSimpleName, Dynamic),
                      pers(options, parameters, objects, source, result));
    return call;
  }

}