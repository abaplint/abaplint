import {ABAPRule} from "./_abap_rule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {Parameter, SelectOption} from "../abap/2_statements/statements";
import {FieldSub} from "../abap/2_statements/expressions";

export class SelectionScreenTextsMissingConf extends BasicRuleConfig {
}

export class SelectionScreenTextsMissing extends ABAPRule {

  private conf = new SelectionScreenTextsMissingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "selection_screen_texts_missing",
      title: "Selection screen texts missing",
      shortDescription: `Checks that selection screen parameters and select-options have selection texts`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectionScreenTextsMissingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];
    const selTexts = obj.getSelectionTexts();

    for (const stat of file.getStatements()) {
      const s = stat.get();
      if (s instanceof Parameter || s instanceof SelectOption) {
        const fieldNode = stat.findFirstExpression(FieldSub);
        if (fieldNode) {
          const fieldName = fieldNode.getFirstToken().getStr().toUpperCase();
          if (selTexts[fieldName] === undefined) {
            issues.push(Issue.atToken(
              file,
              fieldNode.getFirstToken(),
              `Selection text missing for "${fieldName}"`,
              this.getMetadata().key,
              this.conf.severity));
          }
        }
      }
    }

    return issues;
  }
}
