import {IRule} from "./_irule";
import {Issue} from "../issue";
import * as xmljs from "xml-js";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {xmlToArray} from "../xml_utils";
import {ClassDefinition} from "../abap/types";

export class RemoveDescriptionsConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
}

export class RemoveDescriptions implements IRule {

  private conf = new RemoveDescriptionsConf();

  public getKey(): string {
    return "remove_descriptions";
  }

  public getDescription(): string {
    return "Remove descriptions";
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
      let def: ClassDefinition | undefined;
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
    }
// todo, "obj instanceof Objects.Interface"

    return [];
  }

  public checkClass(obj: Objects.Class): Issue[] {
    let xml: string | undefined = undefined;
    try {
      xml = obj.getXML();
    } catch {
      return [];
    }
    if (xml === undefined) {
      return [];
    }
    const parsed: any = xmljs.xml2js(xml, {compact: true});

    const desc = parsed.abapGit["asx:abap"]["asx:values"].DESCRIPTIONS;
    if (desc === undefined) {
      return [];
    }

    const ret: Issue[] = [];
    for (const d of xmlToArray(desc)) {
      if (d.SEOCOMPOTX === undefined) {
        continue;
      }
      const message = "Remove description, " + d.SEOCOMPOTX.CMPNAME._text;
      ret.push(new Issue({file: obj.getFiles()[0], key: this.getKey(), message}));
    }
    return ret;
  }

}