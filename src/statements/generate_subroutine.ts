import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, per, IRunnable} from "../combi";

export class GenerateSubroutine extends Statement {

  public static get_matcher(): IRunnable {
    let name = seq(str("NAME"), new Reuse.Source());
    let message = seq(str("MESSAGE"), new Reuse.Target());
    let messageid = seq(str("MESSAGE-ID"), new Reuse.Target());
    let line = seq(str("LINE"), new Reuse.Target());
    let word = seq(str("WORD"), new Reuse.Target());
    let offset = seq(str("OFFSET"), new Reuse.Target());


    let ret = seq(str("GENERATE SUBROUTINE POOL"),
                  new Reuse.Source(),
                  per(name, message, line, word, offset, messageid));

    return ret;
  }

}