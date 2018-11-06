import {seq, alt, Expression, IRunnable} from "../combi";
import {PassByValue, PassByReference, TypeParam} from "./";
import {MethodParamName} from "./method_param_name";

export class MethodParam extends Expression {
  public getRunnable(): IRunnable {
    let fieldsOrValue = seq(alt(new PassByValue(),
                                new PassByReference(),
                                new MethodParamName),
                            new TypeParam());

    return fieldsOrValue;
  }
}