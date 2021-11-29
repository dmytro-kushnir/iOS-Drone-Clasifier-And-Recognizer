FROM python:3.7-slim

COPY . /app
WORKDIR /app

ARG MODEL_CFG_PATH
ARG MODEL_WEIGHTS_PATH
ARG MODEL_COREML_PATH

RUN pip install -U pip
RUN pip install -r requirements.txt

ENTRYPOINT python ./convert.py ${MODEL_CFG_PATH} ${MODEL_WEIGHTS_PATH} ${MODEL_COREML_PATH}