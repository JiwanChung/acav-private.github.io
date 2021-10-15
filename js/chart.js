(async function(Chart) {
    const colors = [
        '#1f77b4',
        '#ff7f0e',
        '#2ca02c',
        '#d62728',
        '#9467bd',
        '#8c564b',
        '#e377c2',
        '#7f7f7f',
        '#bcbd22',
        '#17becf'
    ];

    const url = window.location.href.split('#')[0];

    function label_func(context) {
        return ' ' + context.formattedValue + ' %';
    }

    async function get_hist(name) {
        const res = await axios.get(`${url}assets/chart/histogram/${name}.json`);
        const dataset = res.data;
        const data = {
            labels: dataset.labels,
            datasets: [
                {
                    label: name,
                    data: dataset.percents,
                    borderColor: 'rgba(71, 112, 255, 0)',
                    backgroundColor: 'rgba(71, 112, 255, 1)',
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: dataset.title
                    },
                    tooltip: {
                        intersect: false,
                        callbacks: {
                            label: label_func
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 90,
                            font: {
                                size: 8
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Ratio of Clips (%)'
                        },
                        ticks: {
                            stepSize: 10
                        }
                    }
                }
            },
        };

        const canvas = document.getElementById(`histogram_${name}`);
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, config);
    };

    async function get_pie(name) {
        const res = await axios.get(`${url}assets/chart/pie/${name}.json`);
        const dataset = res.data;
        const data = {
            labels: dataset.labels,
            datasets: [{
                label: name,
                data: dataset.percents,
                backgroundColor: colors.slice(0, dataset.labels.length),
                hoverOffset: 4
            }]
        };
        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: false,
                        text: dataset.title
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const val = label_func(context);
                                return ' ' + context.label + val;
                            }
                        }
                    }
                }
            }
        };
        const canvas = document.getElementById(`pie_${name}`);
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, config);
    }

    await get_hist('audio');
    await get_hist('video');
    await get_hist('image');

    await get_pie('audio');
})(Chart);
