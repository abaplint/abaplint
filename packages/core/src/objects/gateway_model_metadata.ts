import {AbstractObject} from "./_abstract_object";

export class GatewayModelMetadata extends AbstractObject {

  public getType(): string {
    return "IWOM";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
