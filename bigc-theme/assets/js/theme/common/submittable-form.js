import nod from '../common/nod';

const processingClass = 'is-processing';
const formSuccessClass = 'is-success';
const formErrorClass = 'is-error';

export function toggleProcessing(elem) {
  const isProcessing = elem.classList.toggle(processingClass);

  elem.disabled = isProcessing;

  if (isProcessing) {
    elem.insertAdjacentHTML('beforeend', '<div class="lds-dual-ring"></div>');
  } else {
    elem.removeChild(elem.lastElementChild);
  }
}
function wait(ms, data) {
  return new Promise((resolve) => setTimeout(resolve.bind(this, data), ms));
}

export default function init(formSelector, { attachValidation = () => {}, submitData }) {
  const formValidator = nod({
    submit: `${formSelector} [type="submit"]`,
  });

  function onSubmit(e) {
    e.preventDefault();

    formValidator.performCheck();

    if (!formValidator.areAll('valid')) {
      return;
    }

    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    const feedbackDelay = 300;

    //make UI feedback for request
    toggleProcessing(btn);
    form.classList.remove(formErrorClass);

    wait(feedbackDelay, submitData(form))
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        form.classList.add(formSuccessClass);
      })
      .catch((err) => {
        form.classList.add(formErrorClass);
      })
      .finally(() => toggleProcessing(btn));
  }

  function onReset(e) {
    const form = e.target;
    const { successClass, errorClass, errorMessageClass, successMessageClass } = nod.classes;

    form.classList.remove(formSuccessClass, formErrorClass);
    form
      .querySelectorAll(`.${errorClass}, .${successClass}`)
      .forEach((el) => el.classList.remove(errorClass, successClass));
    form
      .querySelectorAll(`.${errorMessageClass}, .${successMessageClass}`)
      .forEach((el) => (el.style.display = 'none'));
  }

  function registerFormValidation(elem) {
    attachValidation(formValidator);
    elem.addEventListener('submit', onSubmit);
    elem.addEventListener('reset', onReset);
    // Handler.add(elem, {
    //   inputDelegate: `${formSelector}.${formErrorClass}`,
    //   input(e) {
    //     e.delegated.classList.remove(formErrorClass);
    //   },
    // });
    '${formSelector}'.addEventListener ('input', function(e) {
      if (e.target.classList.contains(formErrorClass)) {
        e.target.classList.remove(formErrorClass);
      }
    });

  }

  [].slice.call(document.querySelectorAll(formSelector)).forEach((el) => {
    registerFormValidation(el);
  });
}
