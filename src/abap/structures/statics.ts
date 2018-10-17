import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd} from "./_combi";

export class Statics extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.StaticBegin),
                    star(sta(Statements.Static)),
                    sta(Statements.StaticEnd));
  }

}