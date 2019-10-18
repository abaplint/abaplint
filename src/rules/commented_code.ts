import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile, MemoryFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {Unknown, Empty, Comment} from "../abap/statements/_statement";

/** Detects usage of commented out code. */
export class CommentedCodeConf extends BasicRuleConfig {
}

export class CommentedCode extends ABAPRule {
  private conf = new CommentedCodeConf();

  public getKey(): string {
    return "commented_code";
  }

  private getDescription(): string {
    return "Commented code";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CommentedCodeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let output: Issue[] = [];

    const rows = file.getRawRows();

    let code = "";
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].substr(0, 1) === "*") {
        code = code + rows[i].substr(1) + "\n";
      } else if (code !== "") {
        output = output.concat(this.check(code, file, i - 1));
        code = "";
      }
    }
    output = output.concat(this.check(code, file, rows.length - 1));

    return output;
  }

  private check(code: string, file: ABAPFile, row: number): Issue[] {
    if (code === "") {
      return [];
    }

    const reg = new Registry().addFile(new MemoryFile("_foobar.prog.abap", code)).parse();

    const statements = reg.getABAPFiles()[0].getStatements();
    if (statements.length === 0) {
      return [];
    }
    for (const statement of statements) {
      const type = statement.get();
      if (type instanceof Unknown
          || type instanceof Empty
          || type instanceof Comment) {
        return [];
      }
    }

    const position = new Position(row + 1, 1);
    const issue = Issue.atPosition(file, position, this.getDescription(), this.getKey());
    return [issue];
  }
}