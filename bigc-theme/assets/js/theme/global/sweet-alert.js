import sweetAlert from 'sweetalert2';

// WeakMap will defined in the global scope if native WeakMap is not supported.
const weakMap = new WeakMap(); // eslint-disable-line no-unused-vars

// Set defaults for sweetalert2 popup boxes
sweetAlert.setDefaults({
    buttonsStyling: false,
    confirmButtonClass: 'button',
    cancelButtonClass: 'button',
});

// Re-export
export default sweetAlert;
