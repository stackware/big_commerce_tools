import PageManager from '../page-manager';
import forms from '../common/models/forms';
import nod from '../common/nod';

const contactFormSelector = '.js-contact-form';
const formSuccessClass = 'is-success';
const formErrorClass = 'is-error';
const processingClass = 'is-processing';

export default class CustomContactPage extends PageManager {
  constructor(context) {
    super(context);
  }

  onReady() {
    this.registerContactFormValidation();
  }

  registerContactFormValidation() {
    const contactUsValidator = nod({
      submit: `${contactFormSelector} [type="submit"]`,
    });
    const $contactForm = $(contactFormSelector);

    contactUsValidator.add([
      {
        selector: `${contactFormSelector} input[name="contact_name"]`,
        validate: (cb, val) => {
          const result = forms.notEmpty(val);

          cb(result);
        },
        errorMessage: this.context.contactName,
      },
      {
        selector: `${contactFormSelector} input[name="contact_email"]`,
        validate: (cb, val) => {
          const result = forms.email(val);

          cb(result);
        },
        errorMessage: this.context.contactEmail,
      },
      {
        selector: `${contactFormSelector} textarea[name="contact_message"]`,
        validate: (cb, val) => {
          const result = forms.notEmpty(val);

          cb(result);
        },
        errorMessage: this.context.contactQuestion,
      },
    ]);

    $contactForm.on('submit', event => {
      event.preventDefault();
      contactUsValidator.performCheck();
      if (!contactUsValidator.areAll('valid')) {
        return;
      }
      const form = event.target;
      const btn = form.querySelector('[type="submit"]');
      this.toggleProcessing(btn);
      form.classList.remove(formErrorClass);
        this.submitData(form).then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }

          form.classList.add(formSuccessClass);
        })
          .catch((err) => {
            form.classList.add(formErrorClass);
          }).finally(() => this.toggleProcessing(btn));

      
    });
  }

  // Custom submit form
  submitData(form) {
    const dataObj = {};
    const OTHER_SUBJECT_VALUE = 3;

    //convert form data to JSON
    new FormData(form).forEach((value, key) => (dataObj[key] = value));

    // make server-specific data type changes
    dataObj.subject = Number(dataObj.subject) || OTHER_SUBJECT_VALUE;

    if (dataObj.subscribe) {
      dataObj.subscribe = true;
    }

    return fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObj),
    });
  }

  toggleProcessing(elem) {
    const isProcessing = elem.classList.toggle(processingClass);
  
    elem.disabled = isProcessing;
  
    if (isProcessing) {
      elem.insertAdjacentHTML('beforeend', '<div class="lds-dual-ring"></div>');
    } else {
      elem.removeChild(elem.lastElementChild);
    }
  }
}
