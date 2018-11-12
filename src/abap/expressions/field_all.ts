import {regex as reg, Expression, IRunnable} from "../combi";

export class FieldAll extends Expression {
  public getRunnable(): IRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
// field names with only digits should not be possible
    return reg(/^&?\*?(\/\w+\/)?[\w\*\$]+(~\w+)?$/);
  }
}