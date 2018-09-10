import {alt, Reuse, IRunnable} from "../combi";
import {FieldSymbol, InlineFS} from "./";

export class FSTarget extends Reuse {
  public get_runnable(): IRunnable {
    return alt(new InlineFS(), new FieldSymbol());
  }
}