import {IRule, IRuleMetadata} from "./_irule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject, ITextElements} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {Parameter, SelectOption} from "../abap/2_statements/statements";
import {FieldSub} from "../abap/2_statements/expressions";
import {IncludeGraph} from "../utils/include_graph";
import {XMLParser} from "fast-xml-parser";
import {xmlToArray, unescape} from "../xml_utils";

export class SelectionScreenTextsMissingConf extends BasicRuleConfig {
}

export class SelectionScreenTextsMissing implements IRule {

  private reg: IRegistry;
  private conf = new SelectionScreenTextsMissingConf();
  private graph: IncludeGraph;

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
    this.graph = new IncludeGraph(this.reg);
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const output: Issue[] = [];

    for (const file of obj.getABAPFiles()) {
      let selTexts: ITextElements;

      const mains = this.graph.listMainForInclude(file.getFilename());
      if (mains.length === 1) {
        const mainFile = this.reg.getFileByName(mains[0]);
        const mainObj = mainFile ? this.reg.findObjectForFile(mainFile) as ABAPObject | undefined : undefined;
        selTexts = this.findSelectionTexts(mainObj ?? obj);
      } else {
        selTexts = this.findSelectionTexts(obj);
      }

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
        }
      }
    }

    return output;
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
