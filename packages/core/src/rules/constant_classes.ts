import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {IObject, IRegistry, Objects, Visibility} from "..";
import {InfoConstant} from "../abap/4_file_information/_abap_file_information";

export interface DomainClassMapping {
  /** Domain name. The domain must have fixed values. */
  domain: string,
  /** Class name */
  class: string,
  /** Ensure the type of the constant is an exact match of the domain name. */
  useExactType: boolean
}

/** Checks that constants are in sync with domain fixed values */
export class CosntantClassesConf extends BasicRuleConfig {
  /** Specify a list of domain-class pairs which will be validated */
  public mapping: DomainClassMapping[];
}

export class ConstantClasses implements IRule {
  private conf = new CosntantClassesConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "constant_classes",
      title: "Validate constant classes",
      shortDescription: `Checks that a class contains exactly the constants corresponding to a domain's fixed values.`,
      tags: [RuleTag.Syntax, RuleTag.Styleguide, RuleTag.Quickfix],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CosntantClassesConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (obj instanceof Objects.Domain) {
      const configEntry = this.conf.mapping.find(x => x.domain === obj.getName());
      if (!configEntry) {
        return [];
      }

      const classWithConstants = this.reg.getObject("CLAS", configEntry?.class);
      if(!classWithConstants){
        // one issue on the domain, "constant class is missing"
        // quickfix will implement the whole class
        return [];
      }
      const classContents = classWithConstants?.getFiles()[0] as ABAPFile;
      const info = classContents.getInfo();
      const def = info.getClassDefinitionByName(configEntry.class);
      if (!def) {
        // this issue is checked by rule implement_methods.
        // we will not issue errors that all constants are missing until there is a class implementation
        return [];
      }

      const domainValues: string[] = obj.getFixedValues();
      const issues: Issue[] = [];

      if (obj.getFixedValues().length === 0) {
        // possibly this is not even a domain with fixed values
        issues.push(
          Issue.atStatement(
            classContents,
            classContents.getStatements()[0],
            `Domain ${configEntry.domain} does not contain any fixed values. Either add some values or disable this check`,
            this.getMetadata().key,
            this.conf.severity));
      }
      const constants = def.constants;
      if (!constants) {
        issues.push(
          Issue.atStatement(
            classContents,
            classContents.getStatements()[0],
            `Missing constants for ${domainValues.length} domain values of ${configEntry.domain}`,
            this.getMetadata().key,
            this.conf.severity));
            // quickfix will add all constants
      }

      for (const constant of constants) {

        if (configEntry.useExactType && constant.typeName !== configEntry.domain) {
          issues.push(this.issueAtConstant(
            constant,
            `Use exact type ${configEntry.domain} instead of ${constant.typeName}`));
          // quickfix will change the type
        }

        if (constant.visibility !== Visibility.Public) {
          issues.push(this.issueAtConstant(
            constant,
            `Constant ${constant.name} should be public`));
          // quickfix will move constant
        }

        if (!domainValues.includes(constant.name)) {
          issues.push(this.issueAtConstant(
            constant,
            `Extra constant ${constant.name} found which is not present in domain ${configEntry.domain}`));
          // quickfix will remove constant
        }
      }

      for (const domainValue of domainValues) {
        if (!def.constants.find(x => x.name === domainValue)) {
          issues.push(
            Issue.atStatement(
              classContents,
              classContents.getStatements()[0],
              `Missing constant for ${domainValue} (domain ${configEntry.domain})`,
              this.getMetadata().key,
              this.conf.severity));
          // quickfix will add constant
        }
      }
      return issues;

    }

    return [];
  }

  private issueAtConstant(constant: InfoConstant, message: string): Issue {
    return Issue.atIdentifier(
      constant.identifier,
      message,
      this.getMetadata().key,
      this.conf.severity);
  }
}