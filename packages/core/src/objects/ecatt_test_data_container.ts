import {AbstractObject} from "./_abstract_object";

export class EcattTestDataContainer extends AbstractObject {

  public getType(): string {
    return "ECTD";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
