import {IRule, IRuleMetadata} from "./_irule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ITextElements} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {Parameter, SelectOption, Include, SelectionScreen} from "../abap/2_statements/statements";
import {FieldSub, IncludeName} from "../abap/2_statements/expressions";
import {Program} from "../objects";
import {ABAPFile} from "../abap/abap_file";

export class SelectionScreenTextsMissingConf extends BasicRuleConfig {
}

export class SelectionScreenTextsMissing implements IRule {

  private reg: IRegistry;
  private conf = new SelectionScreenTextsMissingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "selection_screen_texts_missing",
      title: "Selection screen texts missing",
      shortDescription: `Checks that selection screen parameters and select-options have selection texts`,
      extendedInformation: `Excludes parameters and select-options that:
* are inside a "SELECTION-SCREEN BEGIN OF LINE" block
* have the addition "NO-DISPLAY"`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectionScreenTextsMissingConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof Program)) {
      return [];
    }

    if (obj.isInclude()) {
      return [];
    }

    const selTexts = obj.getSelectionTexts();
    const output: Issue[] = [];
    const checked = new Set<string>();

    this.checkFile(obj.getMainABAPFile(), selTexts, output, checked);

    return output;
  }

  private checkFile(file: ABAPFile | undefined, selTexts: ITextElements,
                    output: Issue[], checked: Set<string>, mainProgName: string | undefined = undefined) {
    if (file === undefined) {
      return;
    }

    if (checked.has(file.getFilename())) {
      return;
    }
    checked.add(file.getFilename());

    let inLine = false;
    for (const stat of file.getStatements()) {
      const s = stat.get();
      if (s instanceof SelectionScreen) {
        const tokens = stat.concatTokens().toUpperCase();
        if (tokens.includes("BEGIN OF LINE")) {
          inLine = true;
        } else if (tokens.includes("END OF LINE")) {
          // known issue: doesn't support BEGIN and END OF LINE span across several includes (not seen a lot in the wild)
          inLine = false;
        }
        continue;
      }
      if (s instanceof Include) {
        const nameNode = stat.findFirstExpression(IncludeName);
        if (nameNode) {
          const inclName = nameNode.getFirstToken().getStr().toUpperCase();
          const inclObj = this.reg.getObject("PROG", inclName) as Program | undefined;
          if (inclObj) {
            this.checkFile(inclObj.getMainABAPFile(), selTexts, output, checked, mainProgName ?? file.getFilename());
          }
        }
        continue;
      }
      if (inLine || !(s instanceof Parameter || s instanceof SelectOption)) {
        continue;
      }
      if (stat.concatTokens().toUpperCase().includes("NO-DISPLAY")) {
        continue;
      }

      const fieldNode = stat.findFirstExpression(FieldSub);
      if (fieldNode) {
        const fieldName = fieldNode.getFirstToken().getStr().toUpperCase();
        if (selTexts[fieldName] === undefined) {
          const suffix = mainProgName ? `, ${mainProgName}` : ``;
          output.push(Issue.atToken(
            file,
            fieldNode.getFirstToken(),
            `Selection text missing for "${fieldName}"${suffix}`,
            this.getMetadata().key,
            this.conf.severity));
        }
      }
    }
  }
}
