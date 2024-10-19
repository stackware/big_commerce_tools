export default function () {
        const submitButton = document.getElementById('submitButton');
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Gather form data
            const firstname = $('#firstname').val();
            const email = $('#email').val();

            // Basic form validation
            if (!firstname || !email) {
                alert('Please fill in all required fields.');
                return;
            }

            // Prepare the data for HubSpot
            const data = {
                fields: [
                    {
                        name: "firstname",
                        value: firstname
                    },
                    {
                        name: "email",
                        value: email
                    }
                ],
                context: {
                    pageUri: window.location.href,
                    pageName: document.title
                }
            };

            // Submit the form to HubSpot
            const portalId = '434478';
            const formGuid = 'ef02333d-869f-4c2c-86ac-034c5e3b9ccd';

            const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then((response) => {
                if (!response.ok) {
                  throw Error(response.statusText);
                }
      
                return response.json();
              })
              .then(({ redirectUri }) => {
                alert('Form submitted successfully!');
                window.location.href = redirectUri;
              });
        });
}