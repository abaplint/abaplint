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
// skip END statements, todo
      if (statement instanceof Statements.Endmethod
          || statement instanceof Statements.Endcase
          || statement instanceof Statements.Enddo
          || statement instanceof Statements.Endwhile
          || statement instanceof Statements.Enddefine
          || statement instanceof Statements.Endif
          || statement instanceof Statements.Endtry
          || statement instanceof Statements.Endat
          || statement instanceof Statements.Endloop) {
        continue;
      } else if(this.topParent(statement)
          && this.topParent(statement) instanceof Statements.Class
          && /DEFINITION/.test(this.topParent(statement).concatTokens().toUpperCase())) {
// skip class defintions
// see https://github.com/larshp/abapGit/issues/242
        continue;
      } else if (statement instanceof Statements.Comment) {
        continue;
      } else if (statement instanceof Statements.IncludeType) {
        continue;
      } else if (this.familyContainsTry(statement)) {
// todo, skipping try-catch blocks
        continue;
      }

      let start = this.countParents(statement) * 2 + 1;
      let first = statement.getTokens()[0];

      if (first.getCol() !== start) {
        file.add(new Issue(this, first.getPos(), file));
// one finding per file, pretty printer should fix everything?
        return;
      }
    }
  }

  private topParent(statement: Statements.Statement) {
    let list: Array<Statements.Statement> = [];

    let parent = statement.getParent();
    while(parent) {
      list.push(parent);
      parent = parent.getParent();
    }

    return list.pop();
  }

  private familyContainsTry(statement: Statements.Statement): boolean {
    let parent = statement.getParent();
    if (!parent) {
      return false;
    } else if (parent instanceof Statements.Try) {
      return true;
    } else {
      return this.familyContainsTry(parent);
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