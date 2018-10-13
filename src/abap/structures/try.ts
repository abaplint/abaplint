import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, seq, opt, sub} from "./_combi";
import {Normal} from "./normal";

export class Try extends Structure {

  public getMatcher(): IStructureRunnable {
    let normal = star(sub(new Normal()));
    let cat = seq(sta(Statements.Catch), normal);
    let cleanup = seq(sta(Statements.Cleanup), normal);
    let block = seq(normal, star(cat), opt(cleanup));

    return beginEnd(sta(Statements.Try),
                    block,
                    sta(Statements.EndTry));
  }

}