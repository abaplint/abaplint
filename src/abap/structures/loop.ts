import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub, alt} from "./_combi";
import {Normal, OnChange} from ".";

export class Loop extends Structure {

  public getMatcher(): IStructureRunnable {
    const body = alt(sub(new Normal()), sub(new OnChange()));

    return beginEnd(sta(Statements.Loop),
                    star(body),
                    sta(Statements.EndLoop));
  }

}