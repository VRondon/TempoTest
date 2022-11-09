/* eslint-disable no-console */
export class Logger {
  private service = '';

  constructor(service = '') {
    this.service = service;
  }

  private getPrefix(type: string) {
    if (this.service) {
      return `[${type} at ${this.service}] `;
    }
    return `[${type}] `;
  }

  public log(message?: any, ...optionalParams: any[]) {
    console.log(this.getPrefix('INFO') + message, ...optionalParams);
  }

  public info(message?: any, ...optionalParams: any[]) {
    this.log(message, ...optionalParams);
  }

  public warn(message?: any, ...optionalParams: any[]) {
    console.warn(this.getPrefix('WARN').yellow + message, ...optionalParams);
  }

  public error(message?: any, error?: any, ...optionalParams: any[]) {
    console.info(this.getPrefix('ERROR').red + message, ...optionalParams);
  }
}
