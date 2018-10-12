import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, seq, opt} from "./_combi";

export class Try extends Structure {
  private body: IStructureRunnable;

  public constructor(body: IStructureRunnable) {
    super();
    this.body = body;
  }

  public getMatcher(): IStructureRunnable {
    let cat = seq(sta(Statements.Catch), star(this.body));
    let cleanup = seq(sta(Statements.Cleanup), star(this.body));
    let block = seq(star(this.body), star(cat), opt(cleanup));

    return beginEnd(sta(Statements.Try),
                    block,
                    sta(Statements.EndTry));
  }

}