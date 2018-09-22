import {regex as reg, Reuse, IRunnable} from "../combi";

export class MessageClass extends Reuse {
  public get_runnable(): IRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return reg(/^>?(\/\w+\/)?\w+#?@?\/?!?&?>?$/);
  }
}