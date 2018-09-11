import {seq, opt, str, Reuse, IRunnable} from "../combi";
import {Field, SimpleName, Target} from "./";

export class ParameterException extends Reuse {
  public get_runnable(): IRunnable {
    return seq(new Field(),
               str("="),
//               alt(new Constant, new FieldSub(), new FieldChain()),
               new SimpleName(),
               opt(seq(str("MESSAGE"), new Target())));
  }
}