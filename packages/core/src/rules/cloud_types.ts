import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {Issue} from "../issue";
import {Version} from "../version";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";

export class CloudTypesConf extends BasicRuleConfig {
}

export class CloudTypes implements IRule {
  private reg: IRegistry;
  private conf = new CloudTypesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cloud_types",
      title: "Check cloud types",
      shortDescription: `Checks that the package does not contain any object types unsupported in cloud ABAP.`,
      tags: [RuleTag.SingleFile, RuleTag.Syntax],
    };
  }

  private getDescription(objectType: string): string {
    return "Object type " + objectType + " not supported in cloud";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CloudTypesConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public static isCloud(obj: IObject): boolean {
    return obj instanceof Objects.ApplicationJobCatalogEntry
      || obj instanceof Objects.ApplicationJobTemplate
      || obj instanceof Objects.APIReleaseState
      || obj instanceof Objects.AssignmentServiceToAuthorizationGroup
      || obj instanceof Objects.ATCCheckCategory
      || obj instanceof Objects.ApplicationDescriptorsFiori
      || obj instanceof Objects.ATCCheckObject
      || obj instanceof Objects.ATCCheckVariant
      || obj instanceof Objects.AuthorizationCheckField
      || obj instanceof Objects.AuthorizationObject
      || obj instanceof Objects.AuthorizationObjectExtension
      || obj instanceof Objects.BehaviorDefinition
      || obj instanceof Objects.BusinessCatalog
      || obj instanceof Objects.BusinessCatalogAppAssignment
      || obj instanceof Objects.CDSMetadataExtension
      || obj instanceof Objects.Class
      || obj instanceof Objects.ApplicationLogObject
      || obj instanceof Objects.CommunicationScenario
      || obj instanceof Objects.DataControl
      || obj instanceof Objects.DataDefinition
      || obj instanceof Objects.DataElement
      || obj instanceof Objects.Domain
      || obj instanceof Objects.EventBinding
      || obj instanceof Objects.EventConsumer
      || obj instanceof Objects.FunctionGroup
      || obj instanceof Objects.HttpService
      || obj instanceof Objects.IAMApp
      || obj instanceof Objects.InboundService
      || obj instanceof Objects.Interface
      || obj instanceof Objects.LockObject
      || obj instanceof Objects.MessageClass
      || obj instanceof Objects.NumberRange
      || obj instanceof Objects.OutboundService
      || obj instanceof Objects.Package
      || obj instanceof Objects.RestrictionField
      || obj instanceof Objects.RestrictionType
      || obj instanceof Objects.ServiceBinding
      || obj instanceof Objects.ServiceDefinition
      || obj instanceof Objects.Table
      || obj instanceof Objects.TableType
      || obj instanceof Objects.Transformation;
  }

  public run(obj: IObject): Issue[] {
    if (this.reg.getConfig().getVersion() !== Version.Cloud || CloudTypes.isCloud(obj)) {
      return [];
    }

    const position = new Position(1, 1);
    const issue = Issue.atPosition(
      obj.getFiles()[0],
      position,
      this.getDescription(obj.getType()),
      this.getMetadata().key,
      this.conf.severity);
    return [issue];
  }

}