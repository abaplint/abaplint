import {AbstractObject} from "./_abstract_object";

export class GatewayService extends AbstractObject {

  public getType(): string {
    return "IWSV";
  }

  public getAllowedNaming() {
    return {
      maxLength: 39,
      allowNamespace: true,
    };
  }
}
