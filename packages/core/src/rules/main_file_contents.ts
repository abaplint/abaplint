import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import * as Objects from "../objects";
import {ABAPObject} from "../objects/_abap_object";
import {IRule} from "./_irule";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Position} from "../position";
import {Comment} from "../abap/2_statements/statements/_statement";

export class MainFileContentsConf extends BasicRuleConfig {
}

export class MainFileContents implements IRule {
  private conf = new MainFileContentsConf();

  public getMetadata() {
    return {
      key: "main_file_contents",
      title: "Main file contents",
      shortDescription: `Checks related to report declarations.`,
    };
  }

  private getDescription(details: string): string {
    return "Main file must have specific contents: " + details;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MainFileContentsConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const main = obj.getMainABAPFile();
    if (main === undefined) {
      return [];
    }
    const stru = main.getStructure();
    if (stru === undefined) {
      return [];
    }

    if (obj instanceof Objects.Program && obj.isInclude() === false) {
      let count = 0;
      let first = main.getStatements()[count];
      while (first !== undefined && first.get() instanceof Comment) {
        count = count + 1;
        first = main.getStatements()[count];
      }
      if (first === undefined || !(first.get() instanceof Statements.Report
          || first.get() instanceof Statements.Program)) {
        const position = new Position(1, 1);
        const issue = Issue.atPosition(main, position, this.getDescription("Report must begin with REPORT or PROGRAM"), this.getMetadata().key, this.conf.severity);
        return [issue];
      }
      const name = first.findFirstExpression(Expressions.ReportName);
      if (name === undefined) {
        const token = first.getFirstToken();
        const issue = Issue.atToken(
          main, token, this.getDescription("Add report name to REPORT or PROGRAM statement"), this.getMetadata().key, this.conf.severity);
        return [issue];
      } else if (name.getFirstToken().getStr().toUpperCase() !== obj.getName()) {
        const token = name.getFirstToken();
        const issue = Issue.atToken(main, token, this.getDescription("REPORT or PROGRAM name should match filename"), this.getMetadata().key, this.conf.severity);
        return [issue];
      }
    }

    return [];
  }
}