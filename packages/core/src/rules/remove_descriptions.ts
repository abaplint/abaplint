import {IRule, IRuleMetadata} from "./_irule";
import {Issue} from "../issue";
import {XMLParser} from "fast-xml-parser";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IFile} from "../files/_ifile";
import {Position} from "../position";
import {InfoClassDefinition} from "../abap/4_file_information/_abap_file_information";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {xmlToArray} from "../xml_utils";

export class RemoveDescriptionsConf extends BasicRuleConfig {
  /** Ignore global exception classes */
  public ignoreExceptions: boolean = false;
  /** Ignore global workflow classes */
  public ignoreWorkflow: boolean = true;
}

export class RemoveDescriptions implements IRule {

  private conf = new RemoveDescriptionsConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "remove_descriptions",
      title: "Remove descriptions",
      shortDescription: `Ensures you have no descriptions in metadata of methods, parameters, etc.

Class descriptions are required, see rule description_empty.

Consider using ABAP Doc for documentation.`,
      tags: [],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: RemoveDescriptionsConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
// plan is omitting knowledge about descriptions in abaplint, so this rule must parse the XML
    const ddic = new DDIC(this.reg);
    if (obj instanceof Objects.Class) {
      let def: InfoClassDefinition | undefined;
      try {
        def = obj.getClassDefinition();
      } catch {
        return [];
      }
      if (def === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && ddic.isException(def, obj)) {
        return [];
      } else if (this.conf.ignoreWorkflow === true && def.interfaces.find(e => e.name.toUpperCase() === "IF_WORKFLOW")) {
        return [];
      }
      return this.checkClass(obj);
    } else if (obj instanceof Objects.Interface) {
      return this.checkInterface(obj);
    }

    return [];
  }

//////////////

  private checkInterface(obj: Objects.Interface): Issue[] {
    const xml = obj.getXML();
    if (xml === undefined) {
      return [];
    }
    const file = obj.getXMLFile();
    if (file === undefined) {
      return [];
    }
    return this.checkXML(xml, file);
  }

  private checkClass(obj: Objects.Class): Issue[] {
    const xml = obj.getXML();
    if (xml === undefined) {
      return [];
    }
    const file = obj.getXMLFile();
    if (file === undefined) {
      return [];
    }
    return this.checkXML(xml, file);
  }

  private checkXML(xml: string, file: IFile) {
    const parsed = new XMLParser({parseTagValue: false, ignoreAttributes: true, trimValues: false}).parse(xml);

    if (parsed === undefined || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return [];
    }

    const desc = parsed.abapGit["asx:abap"]["asx:values"].DESCRIPTIONS;
    if (desc === undefined) {
      return [];
    }

    const reported: {[key: string]: boolean} = {}; // there might be multiple translations
    const ret: Issue[] = [];
    for (const d of xmlToArray(desc.SEOCOMPOTX)) {
      const message = "Remove description for " + d.CMPNAME;
      if (reported[d.CMPNAME] !== undefined) {
        continue;
      }

      const position = new Position(1, 1);
      const issue = Issue.atPosition(file, position, message, this.getMetadata().key, this.conf.severity);
      ret.push(issue);

      reported[d.CMPNAME] = true;
    }
    return ret;
  }

}