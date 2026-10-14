import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {SequentialBlank} from "./sequential_blank";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {Position} from "../position";

export enum NewlineLogic {
  Exact = "exact",
  Less = "less",
}

export class NewlineBetweenMethodsConf extends BasicRuleConfig {
  /** Amount of newlines, works in conjunction with "newlineLogic" */
  public count: number = 3;
  /**
   *  Exact: the exact number of required newlines between methods is defined by "newlineAmount"
   *
   *  Less: the required number of newlines has to be less than "newlineAmount"
   */
  public logic: NewlineLogic = NewlineLogic.Less;
}

export class NewlineBetweenMethods extends ABAPRule {
  private conf = new NewlineBetweenMethodsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "newline_between_methods",
      title: "New line between methods",
      shortDescription: `Checks for newlines between method implementations.`,
      tags: [RuleTag.Whitespace, RuleTag.Quickfix, RuleTag.SingleFile],
    };
  }

  private getMessage(): string {
    switch (this.conf.logic) {
      case NewlineLogic.Exact: return `Exactly ${this.conf.count} newlines are required in between methods`;
      case NewlineLogic.Less: return `Less than ${this.conf.count} newlines and at least a single newline are required in between methods`;
      default: return "";
    }
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NewlineBetweenMethodsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const rows = file.getRawRows();
    if (!this.isConfigurationValid()) {
      return [];
    }
    for (const statement of file.getStatements()) {
      let nextRow = statement.getStart().getRow();
      if (!(statement.get() instanceof Statements.EndMethod) || rows[nextRow]?.toUpperCase().includes("ENDCLASS.")) {
        continue;
      }
      let counter = 0;
      while (SequentialBlank.isBlankOrWhitespace(rows[nextRow])) {
        counter++;
        nextRow++;
      }
      if ((counter !== this.conf.count && this.conf.logic === NewlineLogic.Exact)
        || (counter >= this.conf.count && this.conf.logic === NewlineLogic.Less)
        || counter === 0) {
        const fix = this.buildFix(file, rows, statement.getStart().getRow(), counter);
        issues.push(Issue.atStatement(
          file,
          statement,
          this.getMessage(),
          this.getMetadata().key,
          this.conf.severity,
          fix));
      }
    }
    return issues;
  }

  private buildFix(file: ABAPFile, rows: string[], row: number, blanks: number): IEdit | undefined {
    let target = this.conf.count;
    if (this.conf.logic === NewlineLogic.Less) {
      target = blanks === 0 ? 1 : this.conf.count - 1;
    }

    if (blanks < target) {
      const end = new Position(row, rows[row - 1].length + 1);
      return EditHelper.insertAt(file, end, "\n".repeat(target - blanks));
    } else if (blanks > target) {
      const start = new Position(row + target, rows[row + target - 1].length + 1);
      const end = new Position(row + blanks, rows[row + blanks - 1].length + 1);
      return EditHelper.deleteRange(file, start, end);
    }
    return undefined;
  }

  private isConfigurationValid(): boolean {
    if (this.conf.count < 1 || (this.conf.count === 1 && this.conf.logic === NewlineLogic.Less)) {
      return false;
    } else {
      return true;
    }
  }
}