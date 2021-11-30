FROM python:3.7-slim

ARG MODEL_CFG_PATH
ARG MODEL_WEIGHTS_PATH
ARG MODEL_COREML_PATH

COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -U pip
RUN pip install -r requirements.txt

COPY . /app
ENTRYPOINT python ./convert.py ${MODEL_CFG_PATH} ${MODEL_WEIGHTS_PATH} ${MODEL_COREML_PATH} --input_resolution 416