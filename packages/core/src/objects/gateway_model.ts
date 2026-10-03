import {AbstractObject} from "./_abstract_object";

export class GatewayModel extends AbstractObject {

  public getType(): string {
    return "IWMO";
  }

  public getAllowedNaming() {
    return {
      maxLength: 36,
      allowNamespace: true,
    };
  }
}
