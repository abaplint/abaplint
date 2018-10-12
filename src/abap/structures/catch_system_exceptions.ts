import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd} from "./_combi";

export class CatchSystemExceptions extends Structure {
  private body: IStructureRunnable;

  public constructor(body: IStructureRunnable) {
    super();
    this.body = body;
  }

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.CatchSystemExceptions),
                    star(this.body),
                    sta(Statements.EndCatch));
  }

}