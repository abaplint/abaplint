import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class TestSeam extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TestSeam),
                    star(sub(new Normal())),
                    sta(Statements.EndTestSeam));
  }

}