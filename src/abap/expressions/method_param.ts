import {seq, alt, Expression, str, tok, IRunnable} from "../combi";
import {TypeParam} from "./";
import {MethodParamName} from "./method_param_name";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";

export class MethodParam extends Expression {
  public getRunnable(): IRunnable {
    let ref = seq(str("REFERENCE"),
                  tok(ParenLeft),
                  new MethodParamName(),
                  alt(tok(ParenRight), tok(ParenRightW)));

    let value = seq(str("VALUE"),
                    tok(ParenLeft),
                    new MethodParamName(),
                    alt(tok(ParenRight), tok(ParenRightW)));

    let fieldsOrValue = seq(alt(value,
                                ref,
                                new MethodParamName),
                            new TypeParam());

    return fieldsOrValue;
  }
}