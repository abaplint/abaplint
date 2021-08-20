import {IStatement} from "./_statement";
import {seq, alt, per} from "../combi";
import {Target, Source, Dynamic, NamespaceSimpleName, CallTransformationParameters, CallTransformationOptions} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransformation implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = seq("OPTIONS", CallTransformationOptions);

    const parameters = seq("PARAMETERS", CallTransformationParameters);
    const objects = seq("OBJECTS", CallTransformationParameters);

    const source2 = seq("XML", Source);
    const source = seq("SOURCE", alt(CallTransformationParameters, source2));

    const result2 = seq("XML", Target);
    const result = seq("RESULT", alt(CallTransformationParameters, result2));

    const call = seq("CALL TRANSFORMATION",
                     alt(NamespaceSimpleName, Dynamic),
                     per(options, parameters, objects, source, result));
    return call;
  }

}