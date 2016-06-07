import { Rule } from "./rule";
import File from "../file";
import * as Statements from "../statements/";
import Issue from "../issue";
import Position from "../position";

export class IndentationConf {
  public enabled: boolean = true;
}

export class Indentation implements Rule {

  private conf = new IndentationConf();

  public getKey(): string {
    return "indentation";
  }

  public getDescription(): string {
    return "Bad indentation";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    for (let statement of file.getStatements()) {
      if (statement instanceof Statements.Comment) {
        continue;
      }
      let start = this.countParents(statement) * 2 + 1;
      let first = statement.getTokens()[0];

      if (first.getCol() !== start) {
        file.add(new Issue(this, first.getPos(), file));
      }
    }
  }

  private countParents(statement: Statements.Statement): number {
    let parent = statement.getParent();
    if (parent) {
      return 1 + this.countParents(parent);
    } else {
      return 0;
    }
  }
}