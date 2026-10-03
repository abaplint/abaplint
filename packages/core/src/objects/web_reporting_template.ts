import {AbstractObject} from "./_abstract_object";

export class WebReportingTemplate extends AbstractObject {

  public getType(): string {
    return "W3HT";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
