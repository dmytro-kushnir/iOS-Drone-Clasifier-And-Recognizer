FROM python:3.7

COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN apt-get update
RUN apt install -y libgl1-mesa-glx
RUN pip install -U pip
RUN pip install -r requirements.txt

COPY . /app

ENTRYPOINT  sh ./prepare_config.sh ${MODEL_CFG_PATH} ${MODEL_CFG_TEMP_PATH} & \
            python ./convert.py -n ${MODEL_NAMES} -c ${MODEL_CFG_TEMP_PATH} -w ${MODEL_WEIGHTS_PATH} -m ${MODEL_COREML_PATH}