/* eslint-disable no-param-reassign */
import { UiDataHelper } from '@advanced-rest-client/authorization';
import ClientCertificate from './ClientCertificate.js';

/** @typedef {import('@advanced-rest-client/authorization').AuthUiInit} AuthUiInit */
/** @typedef {import('../CcAuthorizationMethodElement').default} CcAuthorizationMethodElement */

export class CcUiDataHelper extends UiDataHelper {
  /**
   * @param {CcAuthorizationMethodElement} element
   * @param {AuthUiInit} init
   */
  static setupClientCertificate(element, init) {
    const i = new ClientCertificate(init);
    i.selected = element.selected;
    i.none = element.none;
    i.importButton = element.importButton;
    i.items = element.items;
    return i;
  }

  /**
   * @param {CcAuthorizationMethodElement} element
   * @param {ClientCertificate} ui
   */
  static populateClientCertificate(element, ui) {
    element.selected = ui.selected;
    element.none = ui.none;
    element.importButton = ui.importButton;
  }
}
