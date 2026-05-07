import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IFile} from "../files/_ifile";
import * as Objects from "../objects";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {XMLValidator} from "fast-xml-parser";

export class XMLConsistencyConf extends BasicRuleConfig {
}

export class XMLConsistency implements IRule {

  private conf = new XMLConsistencyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "xml_consistency",
      title: "XML consistency",
      shortDescription: `Checks the consistency of main XML files, eg. naming for CLAS and INTF objects`,
      tags: [RuleTag.Naming, RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: XMLConsistencyConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];

    const file = obj.getXMLFile();
    if (file === undefined) {
      return issues;
    }

    const xml = obj.getXML();
    if (xml) {
      const res = XMLValidator.validate(xml);
      if (res !== true) {
        issues.push(Issue.atRow(file, 1, "XML parser error: " + res.err.msg, this.getMetadata().key, this.conf.severity));
      }
    }

    // todo, have some XML validation in each object?
    if (obj instanceof Objects.Class) {
      issues.push(...this.runClass(obj, file));
    } else if (obj instanceof Objects.Interface) {
      issues.push(...this.runInterface(obj, file));
    } else if (obj instanceof Objects.DataElement) {
      issues.push(...this.runDataElement(obj, file));
    } else if (obj instanceof Objects.Transaction) {
      issues.push(...this.runTransaction(obj, file));
    }

    return issues;
  }

  private runClass(obj: Objects.Class, file: IFile): Issue[] {
    const issues: Issue[] = [];
    const name = obj.getNameFromXML();
    if (name === undefined) {
      issues.push(Issue.atRow(file, 1, "Name undefined in XML", this.getMetadata().key, this.conf.severity));
    } else if (obj.getDescription() && obj.getDescription()!.length > 60) {
      issues.push(Issue.atRow(file, 1, "Description too long", this.getMetadata().key, this.conf.severity));
    } else if (name !== obj.getName().toUpperCase()) {
      issues.push(Issue.atRow(file, 1, "Name in XML does not match object", this.getMetadata().key, this.conf.severity));
    } else if (obj.getMainABAPFile()?.getStructure() !== undefined && obj.getClassDefinition() === undefined) {
      issues.push(Issue.atRow(file, 1, "Class matching XML name not found in ABAP file", this.getMetadata().key, this.conf.severity));
    }
    return issues;
  }

  private runInterface(obj: Objects.Interface, file: IFile): Issue[] {
    const issues: Issue[] = [];
    const name = obj.getNameFromXML();
    if (name === undefined) {
      issues.push(Issue.atRow(file, 1, "Name undefined in XML", this.getMetadata().key, this.conf.severity));
    } else if (obj.getDescription() && obj.getDescription()!.length > 60) {
      issues.push(Issue.atRow(file, 1, "Description too long", this.getMetadata().key, this.conf.severity));
    } else if (name !== obj.getName().toUpperCase()) {
      issues.push(Issue.atRow(file, 1, "Name in XML does not match object", this.getMetadata().key, this.conf.severity));
    } else if (obj.getDefinition() !== undefined && obj.getDefinition()?.getName().toUpperCase() !== name.toUpperCase()) {
      issues.push(Issue.atRow(file, 1, "Interface matching XML name not found in ABAP file", this.getMetadata().key, this.conf.severity));
    }
    return issues;
  }

  private checkTextLength(file: IFile, fieldName: string, text: string | undefined,
                          maxLength: string | number | undefined, lang?: string): Issue | undefined {
    if (text === undefined || maxLength === undefined) {
      return undefined;
    }
    const max = typeof maxLength === "number" ? maxLength : parseInt(maxLength, 10);
    if (text.length > max) {
      const prefix = lang ? `[${lang}] ` : "";
      return Issue.atRow(file, 1,
                         `${prefix}${fieldName} "${text}" exceeds maximum length of ${max} characters (actual: ${text.length})`,
                         this.getMetadata().key, this.conf.severity);
    }
    return undefined;
  }

  private runDataElement(obj: Objects.DataElement, file: IFile): Issue[] {
    const issues: Issue[] = [];
    const texts = obj.getTexts();
    const maxLengths = obj.getTextMaxLengths();

    for (const issue of [
      this.checkTextLength(file, "DDTEXT", obj.getDescription(), 60),
      this.checkTextLength(file, "SCRTEXT_S", texts?.short, maxLengths?.short),
      this.checkTextLength(file, "SCRTEXT_M", texts?.medium, maxLengths?.medium),
      this.checkTextLength(file, "SCRTEXT_L", texts?.long, maxLengths?.long),
      this.checkTextLength(file, "REPTEXT", texts?.heading, maxLengths?.heading),
    ]) {
      if (issue) {issues.push(issue);}
    }

    for (const translation of obj.getTranslationTexts() ?? []) {
      const lang = translation.language;
      for (const issue of [
        this.checkTextLength(file, "DDTEXT", translation.description, 60, lang),
        this.checkTextLength(file, "SCRTEXT_S", translation.short, maxLengths?.short, lang),
        this.checkTextLength(file, "SCRTEXT_M", translation.medium, maxLengths?.medium, lang),
        this.checkTextLength(file, "SCRTEXT_L", translation.long, maxLengths?.long, lang),
        this.checkTextLength(file, "REPTEXT", translation.heading, maxLengths?.heading, lang),
      ]) {
        if (issue) {issues.push(issue);}
      }
    }

    return issues;
  }

  private runTransaction(obj: Objects.Transaction, file: IFile): Issue[] {
    const maxTextLength = 36;
    const issues: Issue[] = [];

    const push = (issue: Issue | undefined) => { if (issue) { issues.push(issue); } };

    push(this.checkTextLength(file, "TTEXT", obj.getDescription(), maxTextLength));

    for (const translation of obj.getTranslationTexts() ?? []) {
      push(this.checkTextLength(file, "TTEXT", translation.description, maxTextLength, translation.language));
    }

    return issues;
  }
}