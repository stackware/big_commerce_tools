import PageManager from './page-manager';
import youtubeCarouselFactory from '../chiara/youtube-carousel';

export default class Home extends PageManager {
    onReady() {
        if (this.context.hasCarouselVideo) {
            youtubeCarouselFactory($('.heroCarousel'));
        }
        this.slide();
        // this.downloadForm();

    }

    // Custome slide WP posts
    slide() {
        $.ajax({
            url: "https://blog.allaboutlearningpress.com/wp-json/wp/v2/posts?_embed",
            method: "GET",
            success: function (data) {
                // Loop through posts and extract necessary information
                let postsHtml = '';
                data.forEach(function (post) {
                    let postTitle = post.title.rendered;
                    let postLink = post.link;
                    let postAuthor = post._embedded.author[0].name;
                    let postImage = post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : ''; // Featured image URL

                    // Construct the HTML for the slider
                    postsHtml += `
                        <div class="blog-item">
                            <img src="${postImage}" alt="">
                            <span class="blog-title">${postTitle}</span>
                            <div class="blog-info">
                                <span class="blog-author">${postAuthor}</span>
                                <a class="blog-read-more" href="${postLink}" target="_blank">Read Aloud Revival Podcast</a>
                            </div>
                        </div>
                    `;
                });

                // Inject posts into slider container
                $('.post-slider').html(postsHtml);


            }
        });

        const itemList = document.querySelector('.post-slider'); // Cập nhật selector
        let itemWidth;

        // Lấy kích thước của 1 item sau khi nội dung được tải
        $(document).ajaxStop(function () {
            itemWidth = itemList.querySelector('.blog-item').offsetWidth + 20; // 20 là khoảng cách gap giữa các item

            // Sự kiện click cho nút next
            $('body').on('click', '.next-button', function (event) {
                itemList.scrollBy({
                    left: itemWidth * 3, // Cuộn qua 3 item
                    behavior: 'smooth'   // Cuộn mượt mà
                });
            });

            // Sự kiện click cho nút prev
            $('body').on('click', '.prev-button', function (event) {
                itemList.scrollBy({
                    left: -itemWidth * 3, // Cuộn lùi lại 3 item
                    behavior: 'smooth'    // Cuộn mượt mà
                });
            });
        });
    }

    // downloadForm() {
    //     const form = document.getElementById('custom-download-form');
    //     const submitButton = document.getElementById('submitButton');
    //     submitButton.addEventListener('click', function (e) {
    //         e.preventDefault();
    //         console.log("Clickkkk");

    //         // Gather form data
    //         const firstname = $('#firstname').val();
    //         const email = $('#email').val();

    //         // Basic form validation
    //         if (!firstname || !email) {
    //             alert('Please fill in all required fields.');
    //             return;
    //         }

    //         // Prepare the data for HubSpot
    //         const data = {
    //             fields: [
    //                 {
    //                     name: "firstname",
    //                     value: firstname
    //                 },
    //                 {
    //                     name: "email",
    //                     value: email
    //                 }
    //             ],
    //             context: {
    //                 pageUri: window.location.href,
    //                 pageName: document.title
    //             }
    //         };

    //         // Submit the form to HubSpot
    //         const portalId = '434478';
    //         const formGuid = 'ef02333d-869f-4c2c-86ac-034c5e3b9ccd';

    //         const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

    //         fetch(url, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(data)
    //         })
    //         .then((response) => {
    //             if (!response.ok) {
    //               throw Error(response.statusText);
    //             }
      
    //             return response.json();
    //           })
    //           .then(({ redirectUri }) => {
    //             alert('Form submitted successfully!');
    //             window.location.href = redirectUri;
    //           });
    //     });
    // }
}
