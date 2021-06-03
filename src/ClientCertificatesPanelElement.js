/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
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
import { LitElement, html } from 'lit-element';
import { ExportEvents, TelemetryEvents, ArcModelEvents } from '@advanced-rest-client/arc-events';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@advanced-rest-client/arc-models/export-options.js';
import '@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import styles from './styles/ClientCertificatesPanel.js';
import { certificate } from './icons.js'
import { ClientCertificatesConsumerMixin, handleException } from './ClientCertificatesConsumerMixin.js';
import '../certificate-import.js';
import '../certificate-details.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-dialog').AnypointDialog} AnypointDialog */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('@advanced-rest-client/arc-types').ClientCertificate.ARCCertificateIndex} ARCCertificateIndex */

export const renderPage = Symbol('renderPage');
export const headerTemplate = Symbol('headerTemplate');
export const busyTemplate = Symbol('busyTemplate');
export const unavailableTemplate = Symbol('unavailableTemplate');
export const listTemplate = Symbol('listTemplate');
export const listItemTemplate = Symbol('listItemTemplate');
export const exportTemplate = Symbol('exportTemplate');
export const certDetailsTemplate = Symbol('certDetailsTemplate');
export const clearDialogTemplate = Symbol('clearDialogTemplate');
export const renderList = Symbol('renderList');
export const renderAddCert = Symbol('renderList');
export const cancelImport = Symbol('renderList');
export const sheetClosedHandler = Symbol('sheetClosedHandler');
export const certDetailsHandler = Symbol('certDetailsHandler');
export const clearDialogResultHandler = Symbol('clearDialogResultHandler');
export const cancelExportOptions = Symbol('cancelExportOptions');
export const acceptExportOptions = Symbol('acceptExportOptions');
export const doExportItems = Symbol('doExportItems');
export const exportAllFile = Symbol('exportAllFile');
export const deleteAllClickHandler = Symbol('deleteAllClickHandler');
export const errorTemplate = Symbol('errorTemplate');

/**
 * A view that renders list of client certificates installed in the application.
 *
 * It allows to preview certificate details, add new certificate, and
 * to remove certificate from the store.
 *
 * The element uses web events to communicate with the data store. Your application
 * can have own implementation but we suggest using `@advanced-rest-client/arc-models`
 * with `client-certificate-model` to store certificates in browser's internal
 * data store.
 * Consider this when 3rd party scripts runs on your page.
 */
export class ClientCertificatesPanelElement extends ClientCertificatesConsumerMixin(LitElement) {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * When set a certificate details dialog is opened.
       */
      certDetailsOpened: { type: Boolean },
      /**
       * An ID of the certificate to be passed on the details view element.
       */
      openedDetailsId: { type: String },

      page: { type: Number },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      exportOptionsOpened: { type: Boolean },
      /** 
       * The last error message
       */
      errorMessage: { type: String },
    };
  }

  constructor() {
    super();
    this.page = 0;
    this.compatibility = false;
    this.outlined = false;
    this.certDetailsOpened = false;
    this.openedDetailsId = undefined;
    this.errorMessage = undefined;
  }

  /**
   * Handles an exception by sending exception details to GA.
   * @param {string} message A message to send.
   */
  [handleException](message) {
    super[handleException](message);
    this.errorMessage = message;
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `[doExportItems]()`
   */
  async [acceptExportOptions](e) {
    this.exportOptionsOpened = false;
    const { detail } = e;
    const po = /** @type ProviderOptions */ (detail.providerOptions);
    const eo = /** @type ExportOptions */ (detail.exportOptions);
    return this[doExportItems](eo, po);
  }

  [cancelExportOptions]() {
    this.exportOptionsOpened = false;
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'cancel-export',
    });
  }

  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {ExportOptions} options Export configuration
   * @param {ProviderOptions} provider Export provider configuration
   * @return {Promise}
   */
  async [doExportItems](options, provider) {
    const init = { ...options };
    init.kind = 'ARC#ClientCertificate';
    const data = {
      clientcertificates: true,
    };
    this.errorMessage = undefined;
    try {
      const result = await ExportEvents.nativeData(this, data, init, provider);
      if (!result) {
        throw new Error('Certificates: Export module not found');
      }
      // if (detail.options.provider === 'drive') {
      //   // TODO: Render link to the folder
      //   this.shadowRoot.querySelector('#driveSaved').opened = true;
      // }
    } catch (e) {
      this[handleException](e.message);
    }
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'export',
      label: init.provider,
    });
  }

  /**
   * Menu item handler to export all data to file
   * @return {Promise<void>} Result of calling `[doExportItems]()`
   */
  [exportAllFile]() {
    const exportOptions = /** @type ExportOptions */ ({
      provider: 'file',
    });
    const providerOptions = /** @type ProviderOptions */ ({
      file: 'arc-client-certificates.json'
    });
    return this[doExportItems](exportOptions, providerOptions);
  }

  /**
   * Menu item handler to export all data to file
   */
  openExportAll() {
    this.exportOptionsOpened = true;
  }

  // Handler for delete all menu option click
  [deleteAllClickHandler]() {
    const dialog = /** @type AnypointDialog */ (this.shadowRoot.querySelector('#dataClearDialog'));
    dialog.opened = true;
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'delete-all-started',
    });
  }

  // Called when delete datastore dialog is closed.
  [clearDialogResultHandler](e) {
    if (!e.detail.confirmed) {
      return;
    }
    const { items } = this;
    if (!items || !items.length) {
      return;
    }
    ArcModelEvents.destroy(this, ['client-certificates']);
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'delete-all',
    });
  }

  /**
   * Initializes the cert adding flow
   */
  addCertificate() {
    this.page = 1;
    TelemetryEvents.view(this, 'import-certificate');
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'add',
    });
  }

  [cancelImport]() {
    this.page = 0;
  }

  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  [certDetailsHandler](e) {
    const index = Number(e.currentTarget.dataset.index);
    this.openedDetailsId = this.items[index]._id;
    this.certDetailsOpened = true;
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'show-details',
    });
  }

  render() {
    return html`
    ${this[busyTemplate]()}
    ${this[errorTemplate]()}
    ${this[renderPage]()}
    ${this[exportTemplate]()}
    ${this[certDetailsTemplate]()}
    ${this[clearDialogTemplate]()}
    `;
  }

  [headerTemplate]() {
    const { compatibility, dataUnavailable } = this;
    if (dataUnavailable) {
      return '';
    }
    return html`<div class="header">
      <h2>Client certificates</h2>
      <div class="header-actions">
        <anypoint-menu-button
          dynamicAlign
          closeOnActivate
          id="mainMenu"
          ?compatibility="${compatibility}">
          <anypoint-icon-button
            aria-label="Activate to open context menu"
            slot="dropdown-trigger"
            ?compatibility="${compatibility}"
          >
            <arc-icon icon="moreVert"></arc-icon>
          </anypoint-icon-button>
          <anypoint-listbox
            slot="dropdown-content"
            id="mainMenuOptions"
            ?compatibility="${compatibility}"
          >
            <anypoint-icon-item
              class="menu-item"
              data-action="add"
              ?compatibility="${compatibility}"
              @click="${this.addCertificate}"
            >
              <arc-icon slot="item-icon" icon="addCircleOutline"></arc-icon>
              Add a certificate
            </anypoint-icon-item>
            <anypoint-icon-item
              class="menu-item"
              data-action="export-all"
              ?compatibility="${compatibility}"
              @click="${this.openExportAll}"
            >
              <arc-icon slot="item-icon" icon="exportVariant"></arc-icon>
              Export all
            </anypoint-icon-item>
            <anypoint-icon-item
              class="menu-item"
              data-action="delete-all"
              ?compatibility="${compatibility}"
              @click="${this[deleteAllClickHandler]}"
            >
              <arc-icon slot="item-icon" icon="deleteIcon"></arc-icon>
              Delete all
            </anypoint-icon-item>
          </anypoint-listbox>
        </anypoint-menu-button>
      </div>
    </div>`;
  }

  [busyTemplate]() {
    if (!this.loading) {
      return '';
    }
    return html`<progress></progress>`;
  }

  [unavailableTemplate]() {
    const { dataUnavailable, compatibility } = this;
    if (!dataUnavailable) {
      return '';
    }
    return html`
    <div class="empty-screen">
      <span class="empty-image">${certificate}</span>
      <div class="empty-title">Client certificates</div>
      <p class="empty-info">
        Certificates allows you to authenticate a request without a password, when server support this method.
      </p>

      <p class="empty-info">
        Currently there are no certificates stored in the application.
      </p>

      <div>
        <anypoint-button
          emphasis="medium"
          data-action="empty-add-cert"
          @click="${this.addCertificate}"
          class="empty-add-cert"
          ?compatibility="${compatibility}"
        >Import a certificate</anypoint-button>
      </div>
    </div>
    `;
  }

  [listTemplate]() {
    const { hasItems } = this;
    if (!hasItems) {
      return '';
    }
    const { compatibility, items } = this;
    if (!Array.isArray(items)) {
      return '';
    }
    const htmlItems = items.map((item, index) => this[listItemTemplate](item, index,compatibility));
    return html`
    ${htmlItems}
    `;
  }

  /**
   * @param {ARCCertificateIndex} item
   * @param {number} index
   * @param {boolean} compatibility
   * @returns {TemplateResult} The template for a list item.
   */
  [listItemTemplate](item, index, compatibility) {
    const { type, name } = item;
    return html`<anypoint-icon-item ?compatibility="${compatibility}" class="list-item">
      <span slot="item-icon" class="cert-type-ico">${type}</span>
      <anypoint-item-body ?compatibility="${compatibility}">
        ${name}
      </anypoint-item-body>
      <anypoint-button
        aria-label="Activate to open certificate details"
        data-index="${index}"
        ?compatibility="${compatibility}"
        @click="${this[certDetailsHandler]}"
      >
        Details
      </anypoint-button>
    </anypoint-icon-item>`;
  }

  [exportTemplate]() {
    const { compatibility, outlined, exportOptionsOpened } = this;
    return html`
    <bottom-sheet
      id="exportOptionsContainer"
      .opened="${exportOptionsOpened}"
      data-open-property="exportOptionsOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <export-options
        id="exportOptions"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        withEncrypt
        file="arc-client-certificates.json"
        provider="file"
        @accept="${this[acceptExportOptions]}"
        @cancel="${this[cancelExportOptions]}"
      ></export-options>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult} The template for a certificate details dialog
   */
  [certDetailsTemplate]() {
    const { certDetailsOpened, openedDetailsId, compatibility } = this;
    return html`
    <bottom-sheet
      id="certificateDetailsContainer"
      data-open-property="certDetailsOpened"
      @closed="${this[sheetClosedHandler]}"
      .opened="${certDetailsOpened}"
    >
      <certificate-details .certId="${openedDetailsId}" ?compatibility="${compatibility}"></certificate-details>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult} The template for the confirm delete all dialog
   */
  [clearDialogTemplate]() {
    const { compatibility } = this;
    return html`
    <anypoint-dialog
      id="dataClearDialog"
      ?compatibility="${compatibility}"
      @closed="${this[clearDialogResultHandler]}"
    >
      <div class="title">Remove all certificates?</div>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?compatibility="${compatibility}"
          data-action="delete-export-all"
          @click="${this[exportAllFile]}"
        >Create backup file</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          data-dialog-dismiss
        >Cancel</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          data-dialog-confirm
          class="action-button"
        >Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }

  /**
   * @returns {TemplateResult} The template for the certificates list
   */
  [renderList]() {
    return html`
    ${this[headerTemplate]()}
    ${this[unavailableTemplate]()}
    ${this[listTemplate]()}`;
  }

  /**
   * @returns {TemplateResult} The template for the certificate import element
   */
  [renderAddCert]() {
    const { compatibility, outlined } = this;
    return html`
    <certificate-import
      @close="${this[cancelImport]}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    ></certificate-import>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the current page
   */
  [renderPage]() {
    if (this.page === 1) {
      return this[renderAddCert]();
    }
    return this[renderList]();
  }


  /**
   * @returns {TemplateResult|string} The template for the error message, when set.
   */
  [errorTemplate]() {
    const { errorMessage } = this;
    if (!errorMessage) {
      return '';
    }
    return html`
    <div class="error-message">${errorMessage}</div>
    `;
  }
}
