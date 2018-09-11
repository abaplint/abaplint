import {regex as reg, Reuse, IRunnable} from "../combi";

export class FieldAll extends Reuse {
  public get_runnable(): IRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
// field names with only digits should not be possible
    return reg(/^&?\*?(\/\w+\/)?\w+(~\w+)?$/);
  }
}