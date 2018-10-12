import {seq, alt, regex as reg, Expression, IRunnable} from "../combi";
import {PassByValue, PassByReference, TypeParam} from "./";

export class MethodParam extends Expression {
  public get_runnable(): IRunnable {
    let field = reg(/^!?(\/\w+\/)?\w+$/);
    let fieldsOrValue = seq(alt(new PassByValue(), new PassByReference(), field), new TypeParam());

    return fieldsOrValue;
  }
}