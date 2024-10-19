import PageManager from './page-manager';
import nod from './common/nod';
import forms from './common/models/forms';

export default class ContactUs extends PageManager {
    onReady() {
        this.registerContactFormValidation();
    }

    registerContactFormValidation() {
        const formSelector = 'form[data-contact-form]';
        const contactUsValidator = nod({
            submit: `${formSelector} input[type="submit"]`,
        });
        const $contactForm = $(formSelector);

        contactUsValidator.add([
            {
                selector: `${formSelector} input[name="contact_email"]`,
                validate: (cb, val) => {
                    const result = forms.email(val);

                    cb(result);
                },
                errorMessage: this.context.contactEmail,
            },
            {
                selector: `${formSelector} textarea[name="contact_question"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.contactQuestion,
            },
        ]);

        $contactForm.on('submit', event => {
            contactUsValidator.performCheck();

            if (contactUsValidator.areAll('valid')) {
                const form = event.target;
                this.submitData(form).then((response) => {
                    if (!response.ok) {
                      throw Error(response.statusText);
                    }
            
                    form.classList.add(formSuccessClass);
                  })
                  .catch((err) => {
                    form.classList.add(formErrorClass);
                  });
                return;
            }

            event.preventDefault();
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
}
