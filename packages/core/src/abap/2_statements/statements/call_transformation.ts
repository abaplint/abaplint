import {IStatement} from "./_statement";
import {seq, alt, per, plus} from "../combi";
import {Target, Field, Source, Dynamic, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransformation implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(Field, "=", Source);

    const options = seq("OPTIONS", plus(field));
    const parameters = seq("PARAMETERS", alt(plus(field), Dynamic));
    const objects = seq("OBJECTS", alt(plus(field), Dynamic));

    const source2 = seq("XML", Source);
    const source = seq("SOURCE", alt(plus(field), source2, Dynamic));

    const result2 = seq("XML", Target);
    const result = seq("RESULT", alt(plus(field), result2, Dynamic));

    const call = seq("CALL TRANSFORMATION",
                     alt(NamespaceSimpleName, Dynamic),
                     per(options, parameters, objects, source, result));
    return call;
  }

}