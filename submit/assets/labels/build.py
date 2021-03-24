import json
import os
from pathlib import Path
import csv


def get_audioset():
    # Load label
    csv_name = 'audioset_labels.csv'
    file_path = Path(os.path.realpath(__file__))
    csv_path = file_path.parent / csv_name

    with open(str(csv_path), 'r') as f:
        reader = csv.reader(f, delimiter=',')
        lines = list(reader)

    labels = []
    ids = []    # Each label has a unique id such as "/m/068hy"
    for i1 in range(1, len(lines)):
        id = lines[i1][1]
        label = lines[i1][2]
        ids.append(id)
        labels.append(label)

    labels = list(set(labels))
    return labels


def get_txt(filename):
    labels = []
    with open(filename, 'r') as f:
        for line in f:
            labels.append(line.strip())
    labels = list(set(labels))
    return labels


def get_imagenet():
    return get_txt('imagenet_labels.txt')


def get_kinetics400():
    return get_txt('kinetics400_labels.txt')


def get_all():
    data = {
        'AudioSet': get_audioset(),
        'Kinetics400': get_kinetics400(),
        'ImageNet': get_imagenet()
    }
    data = {k: sorted(v) for k, v in data.items()}
    return data


def main():
    data = get_all()
    with open('labels.json', 'w') as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    main()
