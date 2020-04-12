import {IRule} from "./_irule";
import {Issue} from "../issue";
import * as xmljs from "xml-js";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {xmlToArray} from "../xml_utils";
import {IFile} from "../files/_ifile";
import {Position} from "../position";
import {IClassDefinition} from "../abap/types/_class_definition";

/** Ensures you have no descriptions in metadata of methods, parameters, etc. For class descriptions, see rule description_empty. */
export class RemoveDescriptionsConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = false;
}

export class RemoveDescriptions implements IRule {

  private conf = new RemoveDescriptionsConf();

  public getMetadata() {
    return {key: "remove_descriptions"};
  }

  private getDescription(name: string): string {
    return "Remove description for " + name;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: RemoveDescriptionsConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
// plan is omitting knowledge about descriptions in abaplint, so this rule must parse the XML
    if (obj instanceof Objects.Class) {
      let def: IClassDefinition | undefined;
      try {
        def = obj.getClassDefinition();
      } catch {
        return [];
      }
      if (def === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && def.isException()) {
        return [];
      }
      return this.checkClass(obj);
    } else if (obj instanceof Objects.Interface) {
      return this.checkInterface(obj);
    }

    return [];
  }

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
    const parsed: any = xmljs.xml2js(xml, {compact: true});

    if (parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return [];
    }

    const desc = parsed.abapGit["asx:abap"]["asx:values"].DESCRIPTIONS;
    if (desc === undefined) {
      return [];
    }

    const ret: Issue[] = [];
    for (const d of xmlToArray(desc.SEOCOMPOTX)) {
      const message = this.getDescription(d.CMPNAME._text);
      const position = new Position(1, 1);
      const issue = Issue.atPosition(file, position, message, this.getMetadata().key);
      ret.push(issue);
    }
    return ret;
  }

}