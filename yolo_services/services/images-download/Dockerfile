FROM python:3.7

COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN apt-get update
RUN apt install -y libgl1-mesa-glx
RUN pip install -U pip
RUN pip install -r requirements.txt

COPY . /app

ENTRYPOINT python ./main.py downloader --classes './classes.txt' -y --type_csv validation --limit 300 \
    && python ./main.py downloader --classes './classes.txt' -y --type_csv train --limit 1500 \
    && python ./convert_annotations.py