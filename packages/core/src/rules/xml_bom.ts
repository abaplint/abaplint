import {EditHelper} from "../edit_helper";
import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";

export class XMLBOMConf extends BasicRuleConfig {
}

export class XMLBOM implements IRule {

  private conf = new XMLBOMConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "xml_bom",
      title: "XML UTF-8 byte order mark",
      shortDescription: "Checks that XML files start with a UTF-8 byte order mark",
      extendedInformation: "Checks that each XML file has a UTF-8 byte order mark (BOM) at its beginning.",
      tags: [RuleTag.Syntax, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: XMLBOMConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    const file = obj.getXMLFile();
    if (file === undefined || file.getRaw().startsWith("\uFEFF")) {
      return [];
    }

    return [this.createIssue(file)];
  }

  private createIssue(file: IFile): Issue {
    const start = new Position(1, 1);
    const fix = EditHelper.insertAt(file, start, "\uFEFF");
    return Issue.atRange(file, start, start, "XML file must start with a UTF-8 byte order mark", this.getMetadata().key, this.conf.severity, fix);
  }
}
