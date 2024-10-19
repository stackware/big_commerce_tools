export default function () {
    let $button;

    const setEditMode = ({ editMode }) => {
        $('body').removeClass('editing-menu-widgets');
        if (editMode) {
            if (!$button) {
                $button = $('<button class="button button--primary">Edit Menu Widgets</button>')
                    .css({
                        position: 'fixed',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                        zIndex: 110,
                        animation: 'editing-menu-button-pulse 1.5s infinite',
                    })
                    .each((i, el) => el.style.setProperty('pointer-events', 'auto', 'important'))
                    .on('click', () => $('body').toggleClass('editing-menu-widgets'))
                    .appendTo('body');
                $(`<style>
                @keyframes editing-menu-button-pulse {
                    0% {
                        box-shadow: 0 5px 20px 0 rgba(0, 0, 0,0.15);
                    }
                    70% {
                        box-shadow: 0 5px 20px 10px rgba(161, 49, 237, .5);
                    }
                    100% {
                        box-shadow: 0 5px 20px 0 rgba(0, 0, 0,0.15);
                    }
                }
                </style>`).appendTo('head');
            } else {
                $button.show();
            }
        } else if ($button) {
            $button.hide();
        }
    };

    window.addEventListener('message', event => {
        try {
            const data = JSON.parse(event.data);
            if (data.action === 'toggle-edit-mode' && data.initiator === 'PAGE_BUILDER') {
                setEditMode(data);
            }
        } catch (error) {
            // do nothing
        }
    });
}
