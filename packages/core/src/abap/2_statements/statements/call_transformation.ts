import {IStatement} from "./_statement";
import {seqs, alt, per, plus} from "../combi";
import {Target, Field, Source, Dynamic, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransformation implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seqs(Field, "=", Source);

    const options = seqs("OPTIONS", plus(field));
    const parameters = seqs("PARAMETERS", alt(plus(field), new Dynamic()));
    const objects = seqs("OBJECTS", alt(plus(field), new Dynamic()));

    const source2 = seqs("XML", Source);
    const source = seqs("SOURCE", alt(plus(field), source2, new Dynamic()));

    const result2 = seqs("XML", Target);
    const result = seqs("RESULT", alt(plus(field), result2, new Dynamic()));

    const call = seqs("CALL TRANSFORMATION",
                      alt(new NamespaceSimpleName(), new Dynamic()),
                      per(options,
                          parameters,
                          objects,
                          source,
                          result));
    return call;
  }

}