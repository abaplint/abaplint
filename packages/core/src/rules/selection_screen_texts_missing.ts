import {IRule, IRuleMetadata} from "./_irule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject, ITextElements} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {Parameter, SelectOption, Include} from "../abap/2_statements/statements";
import {FieldSub, IncludeName} from "../abap/2_statements/expressions";
import {Program} from "../objects";
import {ABAPFile} from "../abap/abap_file";
import {XMLParser} from "fast-xml-parser";
import {xmlToArray, unescape} from "../xml_utils";

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

    const selTexts = this.findSelectionTexts(obj);
    const output: Issue[] = [];
    const checked = new Set<string>();

    this.checkFile(obj.getMainABAPFile(), selTexts, output, checked);

    return output;
  }

  private checkFile(file: ABAPFile | undefined, selTexts: ITextElements, output: Issue[], checked: Set<string>) {
    if (file === undefined) {
      return;
    }

    if (checked.has(file.getFilename())) {
      return;
    }
    checked.add(file.getFilename());

    for (const stat of file.getStatements()) {
      const s = stat.get();
      if (s instanceof Parameter || s instanceof SelectOption) {
        const fieldNode = stat.findFirstExpression(FieldSub);
        if (fieldNode) {
          const fieldName = fieldNode.getFirstToken().getStr().toUpperCase();
          if (selTexts[fieldName] === undefined) {
            output.push(Issue.atToken(
              file,
              fieldNode.getFirstToken(),
              `Selection text missing for "${fieldName}"`,
              this.getMetadata().key,
              this.conf.severity));
          }
        }
      } else if (s instanceof Include) {
        const nameNode = stat.findFirstExpression(IncludeName);
        if (nameNode) {
          const inclName = nameNode.getFirstToken().getStr().toUpperCase();
          const inclObj = this.reg.getObject("PROG", inclName) as Program | undefined;
          if (inclObj) {
            this.checkFile(inclObj.getMainABAPFile(), selTexts, output, checked);
          }
        }
      }
    }
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
