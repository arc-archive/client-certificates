/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { ARCClientCertificate } from '@advanced-rest-client/arc-types/src/models/ClientCertificate';

export declare const certIdValue: unique symbol;
export declare const deleteHandler: unique symbol;
export declare const headerTemplate: unique symbol;
export declare const timeTemplate: unique symbol;
export declare const actionsTemplate: unique symbol;
export declare const detailsTemplate: unique symbol;
export declare const busyTemplate: unique symbol;

/**
 * A view that render a certificate details.
 *
 * Set `certId` property to certificate's identifier and the element
 * queries for the details and populates the view.
 */
export declare class CertificateDetailsElement extends LitElement {
  static get styles(): CSSResult;

  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;
  /**
   * True when currently querying for the certificate
   * @attribute
   */
  querying: boolean;
  /**
   * The ID of the certificate to render.
   * It should not be set when setting `certificate` object.
   * @attribute
   */
  certId: string;
  [certIdValue]: string;
  /**
   * A certificate
   */
  certificate: ARCClientCertificate;

  constructor();

  /**
   * Queries the data store for the certificate information.
   * @param id The ID of the certificate to query for
   */
  queryCertInfo(id: string): Promise<void>;

  /**
   * Dispatches the certificate delete event.
   */
  [deleteHandler](): void;

  render(): TemplateResult;

  /**
   * @returns The template for the dialog title
   */
  [headerTemplate](certificate: ARCClientCertificate): TemplateResult|string;

  /**
   * 
   * @param label The label to render
   * @param value The certificate time value
   * @returns The template for the time element
   */
  [timeTemplate](label: string, value: number): TemplateResult|string;

  /**
   * @returns The template for the dialog actions
   */
  [actionsTemplate](certificate: ARCClientCertificate): TemplateResult|string;

   /**
   * @returns The template for the certificate details
   */
  [detailsTemplate](certificate: ARCClientCertificate): TemplateResult|string;

  [busyTemplate](): TemplateResult|string;
}
