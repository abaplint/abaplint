import {Statement} from "./_statement";
import {str, seq, opt, IRunnable, alt, plus} from "../combi";
import {ClassName} from "../expressions";

export class ClassOther extends Statement {

  public getMatcher(): IRunnable {

    let def = seq(str("DEFERRED"),
                  opt(str("PUBLIC")));

    let local = seq(str("LOCAL FRIENDS"), plus(new ClassName()));

    return seq(str("CLASS"), new ClassName(), str("DEFINITION"), alt(def, local));
  }

}