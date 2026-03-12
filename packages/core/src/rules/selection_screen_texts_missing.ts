import {ABAPRule} from "./_abap_rule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject, ITextElements} from "../objects/_abap_object";
import {Parameter, SelectOption} from "../abap/2_statements/statements";
import {FieldSub} from "../abap/2_statements/expressions";
import {XMLParser} from "fast-xml-parser";
import {xmlToArray, unescape} from "../xml_utils";

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
    const selTexts = this.findSelectionTexts(obj);

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

  private findSelectionTexts(obj: ABAPObject): ITextElements {
    const selTexts: ITextElements = {};
    const raw = obj.getXML();
    if (raw === undefined) {
      return selTexts;
    }

    let parsed: any;
    try {
      parsed = new XMLParser({parseTagValue: false, ignoreAttributes: true, trimValues: false}).parse(raw);
    } catch {
      return selTexts;
    }

    if (parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.TPOOL?.item === undefined) {
      return selTexts;
    }

    for (const t of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"].TPOOL.item)) {
      if (t?.ID === "S") {
        const key = t.KEY;
        if (key === undefined) {
          continue;
        }
        selTexts[key.toUpperCase()] = t.ENTRY ? unescape(t.ENTRY) : "";
      }
    }

    return selTexts;
  }
}
