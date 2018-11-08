import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, seq, opt, sub} from "./_combi";
import {Normal} from "./normal";
import {Catch} from "./catch";

export class Try extends Structure {

  public getMatcher(): IStructureRunnable {
    let normal = star(sub(new Normal()));
    let cleanup = seq(sta(Statements.Cleanup), normal);
    let block = seq(normal, star(sub(new Catch())), opt(cleanup));

    return beginEnd(sta(Statements.Try),
                    block,
                    sta(Statements.EndTry));
  }

}