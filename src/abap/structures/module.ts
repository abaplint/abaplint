import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub, alt} from "./_combi";
import {Normal} from "./normal";

export class Module extends Structure {

  public getMatcher(): IStructureRunnable {
    const body = alt(sub(new Normal()),
                     sta(Statements.Ranges),
                     sta(Statements.Tables));

    return beginEnd(sta(Statements.Module),
                    star(body),
                    sta(Statements.EndModule));
  }

}