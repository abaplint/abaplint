import {Issue} from "../../issue";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {SequentialBlank} from "./sequential_blank";
import * as Statements from "../../abap/statements";

export enum NewlineLogic {
  Exact = "exact",
  Less = "less",
}

/** Checks for newlines between method implementations. */
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

  public getKey(): string {
    return "newline_between_methods";
  }

  private getDescription(): string {
    switch (this.conf.logic) {
      case NewlineLogic.Exact: return `Exactly ${this.conf.count} newlines are required in between methods.`;
      case NewlineLogic.Less: return `Less than ${this.conf.count} newlines are required in between methods.`;
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
      if (!(statement.get() instanceof Statements.EndMethod) || (rows[nextRow].toUpperCase().includes("ENDCLASS."))) {
        continue;
      }
      let counter = 0;
      while (SequentialBlank.isBlankOrWhitespace(rows[nextRow]) && (counter <= this.conf.count + 1)) {
        counter++;
        nextRow++;
      }
      if ((counter !== this.conf.count && this.conf.logic === NewlineLogic.Exact)
        || (counter >= this.conf.count && this.conf.logic === NewlineLogic.Less)
        || counter === 0) {
        issues.push(Issue.atStatement(
          file,
          statement,
          this.getDescription(),
          this.getKey()));
      }
    }
    return issues;
  }

  private isConfigurationValid(): boolean {
    if (this.conf.count < 1 || (this.conf.count === 1 && this.conf.logic === NewlineLogic.Less)) {
      return false;
    } else {
      return true;
    }
  }
}