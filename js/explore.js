(async function($) {
    // image width 150, padding 5 * 2
    // image height 80, padding 5 * 2
    const imageHeight = 90;
    const imageWidth = 160;
    const nRowsOnce = 4;

    function formatId(id) {
        const modified = id.replaceAll(' ', '-_').replaceAll(',', '-__').replaceAll('.', '-___');
        return modified.replaceAll('(', '-____').replaceAll(')', '-_____');
    }

    var getVideoLink = function(id, start) {
        return `//youtube.com/watch?v=${id}&start=${start}&end${start+10}`;
    };
    var getThumbnail = function(id) {
        return `//i.ytimg.com/vi/${id}/mqdefault.jpg`;
    };

    function buildA(item) {
        const id = item[0];
        const start = item[1];
        const video = getVideoLink(id, start);
        const thumbnail = getThumbnail(id);
        const div_a_id = `a_${id}_${start}`
        const div_img_id = `img_${id}_${start}`
        const text_a = `<a href='${video}' id=${div_a_id} target='_blank'></a>`;

        $(text_a).appendTo('#videos');
        const img = new Image();
        $(img).on('load', function(){
                if ($(this)[0].naturalHeight <= 90) {
                    console.log('image not found error', div_a_id);
                    const video_div = jQuery('#videos');
                    const numSkipped = video_div.data('numSkipped');
                    video_div.data('numSkipped', numSkipped + 1);
                } else {
                    $(`#${div_a_id}`).append($(this));
                }
            }).attr({
                src: thumbnail,
                id: div_img_id,
                class: 'thumbnail',
            });

    }

    async function selectClass(e) {
        await _selectClass(this.id);
    };

    async function getVideo(label, id, start, end) {
        const res = await axios.get(`/videos/${label}/${id}/${start}/${end}`);
        return res.data;
    };

    function buildAll(data) {
        if (data && data.length > 0) {
            data.forEach(buildA);
        }
    }

    async function _selectClass(id) {
        $('#videos').empty();
        await loadInit(id);
        $('.className').removeClass('clickedClassName');
        const video_div = jQuery('#videos');
        video_div.data('selectedId', id);
        $(`#${id}`).addClass('clickedClassName');
    }

    var filterLabels = function(data, filter) {
        if (filter) {
            return data.filter(label => label.toLowerCase().includes(filter.toLowerCase()));
        } else {
            return data;
        }
    };

    function getLengthwithDefault(lengths, id) {
        if (lengths[id]) {
            return lengths[id];
        }
        return 0;
    }

    async function getLength(label) {
        const res = await axios.get(`/length/${label}`);
        return res.data;
    };

    async function changeClass() {
        const video_div = jQuery('#videos');
        const selected_id = video_div.data('selectedId');
        var div = $('#classes')
        var labels = div.data('labelData')
        var label = $('#labels').val();
        var filter = $('#filter').val();
        var data = labels[label];
        const lengths = await getLength(label)
        data = filterLabels(data, filter);
        $('#classes').empty();
        if (data && data.length > 0) {
            data = data.map((item) => ({
                id: item,
                length: getLengthwithDefault(lengths, item),
            }));
            data.sort((a, b) => (b.length - a.length));
            data.forEach(function buildDiv(item, index) {
                $('<div/>', {
                    'id': formatId(item.id),
                    'class': 'className',
                    'text': `${item.id} (${item.length})`,
                }).appendTo('#classes');
            });
        }
        $('.className').click(selectClass);
        if (selected_id) {
            $(`#${selected_id}`).addClass('clickedClassName');
        }
    };

    async function selectFirst() {
        const id = $('.className')[0].id;
        await _selectClass(id);
    }

    async function changeLabel() {
        await changeClass();
        await selectFirst();
    };

    $('#labels').change(changeLabel);
    $('#filter').change(changeClass);
    $('#filter').keyup(changeClass);
    $('.className').click(selectClass);
    await changeClass();
    await selectFirst();

    async function loadVideo(id, start, end) {
        const label = $('#labels').val();
        const data = await getVideo(label, id, start, end);
        buildAll(data);
        return data.length;
    }

    async function loadInit(id) {
        const video_div = jQuery('#videos');
        video_div.data('numSkipped', 0);
        const height = $('#gallery').height();
        const numInit = Math.ceil(height / imageHeight) + nRowsOnce + 1;
        const width = $('#gallery').width();
        const perRow = Math.floor(width / imageWidth);
        const numVideos = await loadVideo(id, 0, numInit * perRow);
        video_div.data('currentTop', 0);
        video_div.data('currentVideos', numVideos);
        video_div.data('lock', false);
    }

    $('#gallery').scroll(async function() {
        const video_div = jQuery('#videos');
        let currentTop = video_div.data('currentTop');
        let currentVideos = video_div.data('currentVideos');
        const newTop = $(this).scrollTop();
        if (currentTop < newTop) {
            const height = $('#gallery').height();
            const width = $('#gallery').width();
            const perRow = Math.floor(width / imageWidth);

            const numSkipped = video_div.data('numSkipped');
            const newVideos = (Math.ceil((newTop + height) / imageHeight) + nRowsOnce + 1) * perRow + numSkipped;
            const numVideos = newVideos - currentVideos;
            if (numVideos >= (nRowsOnce * perRow)) {
                const video_div = jQuery('#videos');
                if (!video_div.data('lock')) {
                    // acquire lock
                    video_div.data('lock', true);

                    const id = video_div.data('selectedId');
                    await loadVideo(id, currentVideos, currentVideos + numVideos);
                    currentTop = newTop;
                    currentVideos += numVideos;
                    video_div.data('currentTop', currentTop);
                    video_div.data('currentVideos', currentVideos);

                    // release lock
                    video_div.data('lock', false);
                }
            }
        }
    });
})(jQuery); // End of use strict
