export default function () {
  // Select all decrement buttons
    const decrementButtons = document.querySelectorAll(
        '.qty-form-field--increments button[data-action="dec"]'
      );
      // Select all increment buttons
      const incrementButtons = document.querySelectorAll(
        '.qty-form-field--increments button[data-action="inc"]'
      );
  
      // Add event listeners for decrement buttons
      decrementButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          // Find the associated input field
          const input = button
            .closest(".qty-form-increment")
            .querySelector(".form-input--incrementTotal");
          let currentValue = parseInt(input.value);
          // Decrease the value by 1, but not below 1
          if (currentValue > 0) {
            input.setAttribute("value", currentValue - 1);
          }
        });
      });
  
      // Add event listeners for increment buttons
      incrementButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          // Find the associated input field
          const input = button
            .closest(".qty-form-increment")
            .querySelector(".form-input--incrementTotal");
          let currentValue = parseInt(input.value);
          // Increase the value by 1
          input.setAttribute("value", currentValue + 1);
        });
      });
}